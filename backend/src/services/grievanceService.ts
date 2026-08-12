import { Types } from 'mongoose';
import {
  Grievance,
  ComplaintCategory,
  Ward,
  Department,
  AIAnalysis,
  SLAPrediction,
  GrievanceStatusHistory,
  DuplicateMatch,
} from '../models';
import {
  GrievanceStatus,
  Priority,
  AnalysisMethod,
  NotificationType,
  DuplicateMatchStatus,
  UserRole,
} from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { assertGrievanceAccess, resolveDepartmentScope, type AccessContext } from '../utils/accessControl';
import { classifyComplaint } from '../ai/classificationService';
import { computeSlaPrediction } from '../ai/slaPredictionService';
import { detectDuplicates } from '../ai/duplicateDetectionService';
import { generateGrievanceId } from '../utils/grievanceId';
import { runInTransaction, sessionOptions } from '../utils/transaction';
import { getSlaDeadline } from '../utils/slaUtils';
import { escapeRegex } from '../utils/regex';
import { sortByWorkPriority } from '../utils/workPriority';
import { createNotification } from './notificationService';

const POPULATE_FIELDS = [
  { path: 'categoryId', select: 'name description' },
  { path: 'departmentId', select: 'name code' },
  { path: 'wardId', select: 'name code' },
  {
    path: 'assignedOfficerId',
    select: 'designation employeeCode userId',
    populate: { path: 'userId', select: 'name email' },
  },
];

export interface CreateGrievanceInput {
  title: string;
  description: string;
  categoryId: string;
  wardId: string;
  location: string;
  priority: Priority;
}

function isObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id);
}

async function findGrievanceByIdentifier(identifier: string) {
  if (identifier.startsWith('GRV-')) {
    return Grievance.findOne({ grievanceId: identifier });
  }
  if (isObjectId(identifier)) {
    return Grievance.findById(identifier);
  }
  return null;
}

function toAccessContext(userId: string, userRole: UserRole, departmentId?: string): AccessContext {
  return { id: userId, role: userRole, departmentId };
}

export async function getCategories() {
  return ComplaintCategory.find()
    .populate('defaultDepartmentId', 'name code')
    .sort({ name: 1 })
    .lean();
}

export async function getWards() {
  return Ward.find().sort({ name: 1 }).lean();
}

export async function analyzeGrievancePreview(input: CreateGrievanceInput) {
  const category = await ComplaintCategory.findById(input.categoryId).populate(
    'defaultDepartmentId',
    'name'
  );
  if (!category) throw new AppError('Invalid category', 400);

  const ward = await Ward.findById(input.wardId);
  if (!ward) throw new AppError('Invalid ward', 400);

  const classification = classifyComplaint(input.title, input.description, input.priority);

  const duplicates = await detectDuplicates({
    title: input.title,
    description: input.description,
    location: input.location,
    categoryId: category._id as Types.ObjectId,
    wardId: ward._id as Types.ObjectId,
  });

  const now = new Date();
  const slaDeadline = getSlaDeadline(input.priority, now);
  const sla = computeSlaPrediction(input.priority, now, slaDeadline);

  const dept = category.defaultDepartmentId as unknown as { name: string };

  return {
    category: classification.category,
    department: dept?.name ?? classification.department,
    priority: classification.priority,
    duplicateProbability: classification.duplicateProbability,
    slaRisk: sla.riskLevel,
    estimatedResolutionDays: classification.estimatedResolutionDays,
    confidence: classification.confidence,
    detectedKeywords: classification.detectedKeywords,
    recommendation: classification.recommendation,
    analysisMethod: AnalysisMethod.RULE_BASED_DEMO,
    potentialDuplicates: duplicates,
    hasSignificantDuplicate: duplicates.some((d) => d.similarityScore >= 70),
  };
}

export async function createGrievance(citizenId: string, input: CreateGrievanceInput) {
  const category = await ComplaintCategory.findById(input.categoryId).populate(
    'defaultDepartmentId',
    'name'
  );
  if (!category) throw new AppError('Invalid category', 400);

  const ward = await Ward.findById(input.wardId);
  if (!ward) throw new AppError('Invalid ward', 400);

  const department = await Department.findById(category.defaultDepartmentId);
  if (!department) throw new AppError('Department not found for category', 400);

  const classification = classifyComplaint(input.title, input.description, input.priority);
  const now = new Date();
  const slaDeadline = getSlaDeadline(input.priority, now);
  const sla = computeSlaPrediction(input.priority, now, slaDeadline, GrievanceStatus.AI_ANALYZED);

  return runInTransaction(async (session) => {
    const opts = sessionOptions(session);
    const grievanceId = await generateGrievanceId();

    const [grievance] = await Grievance.create(
      [
        {
          grievanceId,
          citizenId,
          title: input.title.trim(),
          description: input.description.trim(),
          categoryId: category._id,
          departmentId: department._id,
          wardId: ward._id,
          location: input.location.trim(),
          priority: input.priority,
          status: GrievanceStatus.AI_ANALYZED,
          slaDeadline,
        },
      ],
      opts
    );

    await GrievanceStatusHistory.create(
      [
        {
          grievanceId: grievance._id,
          newStatus: GrievanceStatus.SUBMITTED,
          changedBy: citizenId,
          comment: 'Grievance submitted by citizen',
          createdAt: now,
        },
        {
          grievanceId: grievance._id,
          oldStatus: GrievanceStatus.SUBMITTED,
          newStatus: GrievanceStatus.AI_ANALYZED,
          changedBy: citizenId,
          comment: 'AI Demo Analysis completed (Rule-Based AI)',
          createdAt: new Date(now.getTime() + 1000),
        },
      ],
      opts
    );

    await AIAnalysis.create(
      [
        {
          grievanceId: grievance._id,
          category: classification.category,
          department: department.name,
          priority: classification.priority,
          duplicateProbability: classification.duplicateProbability,
          slaRisk: sla.riskLevel,
          estimatedResolutionDays: classification.estimatedResolutionDays,
          confidence: classification.confidence,
          detectedKeywords: classification.detectedKeywords,
          recommendation: classification.recommendation,
          analysisMethod: AnalysisMethod.RULE_BASED_DEMO,
        },
      ],
      opts
    );

    await SLAPrediction.create(
      [
        {
          grievanceId: grievance._id,
          slaDeadline,
          predictedResolutionDate: sla.predictedResolutionDate,
          riskLevel: sla.riskLevel,
          riskPercentage: sla.riskPercentage,
          remainingHours: sla.remainingHours,
          recommendation: sla.recommendation,
        },
      ],
      opts
    );

    const duplicates = await detectDuplicates({
      title: input.title,
      description: input.description,
      location: input.location,
      categoryId: category._id as Types.ObjectId,
      wardId: ward._id as Types.ObjectId,
      excludeGrievanceId: grievance._id as Types.ObjectId,
    });

    if (duplicates.length > 0) {
      await DuplicateMatch.insertMany(
        duplicates.map((d) => ({
          grievanceId: grievance._id,
          matchedGrievanceId: d.matchedGrievanceId,
          similarityScore: d.similarityScore,
          reason: d.reason,
          status: DuplicateMatchStatus.POTENTIAL,
        })),
        opts
      );
    }

    await createNotification({
      userId: new Types.ObjectId(citizenId),
      title: 'Grievance Submitted',
      message: `Your grievance ${grievanceId} has been registered successfully.`,
      type: NotificationType.STATUS_UPDATE,
      session,
    });

    const populated = await Grievance.findById(grievance._id).populate(POPULATE_FIELDS).lean();
    const aiAnalysis = await AIAnalysis.findOne({ grievanceId: grievance._id }).lean();
    const slaPrediction = await SLAPrediction.findOne({ grievanceId: grievance._id }).lean();

    return {
      grievance: populated,
      aiAnalysis,
      slaPrediction,
      duplicates,
    };
  });
}

export async function getCitizenOverview(citizenId: string): Promise<{
  total: number;
  inProgress: number;
  resolved: number;
  slaAtRisk: number;
  recent: unknown[];
  grievances: unknown[];
}> {
  const grievances = await Grievance.find({ citizenId })
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 })
    .lean();

  const grievanceIds = grievances.map((g) => g._id);
  const slaPredictions = await SLAPrediction.find({
    grievanceId: { $in: grievanceIds },
  }).lean();
  const slaMap = new Map(slaPredictions.map((s) => [s.grievanceId.toString(), s]));

  const inProgressStatuses = [
    GrievanceStatus.SUBMITTED,
    GrievanceStatus.AI_ANALYZED,
    GrievanceStatus.ASSIGNED,
    GrievanceStatus.UNDER_REVIEW,
    GrievanceStatus.IN_PROGRESS,
    GrievanceStatus.ESCALATED,
  ];

  const resolvedStatuses = [GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED];

  let slaAtRisk = 0;
  for (const g of grievances) {
    const sla = slaMap.get(g._id.toString());
    if (sla && sla.riskPercentage >= 60 && !resolvedStatuses.includes(g.status)) {
      slaAtRisk++;
    }
  }

  const enriched = grievances.map((g) => ({
    ...g,
    slaRisk: slaMap.get(g._id.toString())?.riskLevel ?? null,
    slaRiskPercentage: slaMap.get(g._id.toString())?.riskPercentage ?? null,
  }));

  return {
    total: grievances.length,
    inProgress: grievances.filter((g) => inProgressStatuses.includes(g.status)).length,
    resolved: grievances.filter((g) => resolvedStatuses.includes(g.status)).length,
    slaAtRisk,
    recent: enriched.slice(0, 5),
    grievances: enriched,
  };
}

export async function getMyGrievances(
  citizenId: string,
  filters: {
    search?: string;
    status?: string;
    priority?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ items: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { citizenId };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.categoryId) query.categoryId = filters.categoryId;

  if (filters.search) {
    const safe = escapeRegex(filters.search.trim());
    query.$or = [
      { grievanceId: { $regex: safe, $options: 'i' } },
      { title: { $regex: safe, $options: 'i' } },
      { location: { $regex: safe, $options: 'i' } },
    ];
  }

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  const grievanceIds = grievances.map((g) => g._id);
  const slaPredictions = await SLAPrediction.find({
    grievanceId: { $in: grievanceIds },
  }).lean();
  const slaMap = new Map(slaPredictions.map((s) => [s.grievanceId.toString(), s]));

  const items = grievances.map((g) => ({
    ...g,
    slaRisk: slaMap.get(g._id.toString())?.riskLevel ?? null,
    slaRiskPercentage: slaMap.get(g._id.toString())?.riskPercentage ?? null,
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listGrievances(
  filters: {
    department?: string;
    category?: string;
    priority?: string;
    status?: string;
    slaRisk?: string;
    ward?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    assignedOfficerId?: string;
  },
  access?: AccessContext
): Promise<{ items: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  const scopedDepartment = access ? resolveDepartmentScope(access, filters.department) : filters.department;
  if (scopedDepartment) query.departmentId = scopedDepartment;
  if (filters.category) query.categoryId = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.status) query.status = filters.status;
  if (filters.ward) query.wardId = filters.ward;
  if (filters.assignedOfficerId) query.assignedOfficerId = filters.assignedOfficerId;

  if (filters.search) {
    const safe = escapeRegex(filters.search.trim());
    query.$or = [
      { grievanceId: { $regex: safe, $options: 'i' } },
      { title: { $regex: safe, $options: 'i' } },
      { location: { $regex: safe, $options: 'i' } },
    ];
  }

  if (filters.slaRisk) {
    const slaGrievanceIds = await SLAPrediction.find({ riskLevel: filters.slaRisk }).distinct(
      'grievanceId'
    );
    query._id = { $in: slaGrievanceIds };
  }

  const useSmartSort = filters.sort === 'smart' || (!filters.sort && access);
  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (filters.sort === 'oldest') sortOption = { createdAt: 1 };
  if (filters.sort === 'priority') sortOption = { priority: -1, createdAt: -1 };

  if (useSmartSort) {
    const allGrievances = await Grievance.find(query).populate(POPULATE_FIELDS).lean();
    const allIds = allGrievances.map((g) => g._id);
    const allSla = await SLAPrediction.find({ grievanceId: { $in: allIds } }).lean();
    const slaMap = new Map(allSla.map((s) => [s.grievanceId.toString(), s]));

    const enriched = allGrievances.map((g) => {
      const sla = slaMap.get(g._id.toString());
      return {
        ...g,
        slaRisk: sla?.riskLevel ?? null,
        slaRiskPercentage: sla?.riskPercentage ?? null,
      };
    });

    const sorted = sortByWorkPriority(enriched);
    const items = sorted.slice(skip, skip + limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total: sorted.length,
        totalPages: Math.ceil(sorted.length / limit) || 1,
      },
    };
  }

  const [grievances, total] = await Promise.all([
    Grievance.find(query)
      .populate(POPULATE_FIELDS)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Grievance.countDocuments(query),
  ]);

  const grievanceIds = grievances.map((g) => g._id);
  const slaPredictions = await SLAPrediction.find({
    grievanceId: { $in: grievanceIds },
  }).lean();
  const slaMap = new Map(slaPredictions.map((s) => [s.grievanceId.toString(), s]));

  const items = grievances.map((g) => ({
    ...g,
    slaRisk: slaMap.get(g._id.toString())?.riskLevel ?? null,
    slaRiskPercentage: slaMap.get(g._id.toString())?.riskPercentage ?? null,
  }));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getGrievanceDetails(
  identifier: string,
  userId: string,
  userRole: UserRole,
  departmentId?: string
) {
  const grievance = await findGrievanceByIdentifier(identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  assertGrievanceAccess(grievance, toAccessContext(userId, userRole, departmentId));

  const populated = await Grievance.findById(grievance._id).populate(POPULATE_FIELDS).lean();
  const aiAnalysis = await AIAnalysis.findOne({ grievanceId: grievance._id }).lean();
  const slaPrediction = await SLAPrediction.findOne({ grievanceId: grievance._id }).lean();
  const duplicates = await DuplicateMatch.find({ grievanceId: grievance._id })
    .populate({
      path: 'matchedGrievanceId',
      select: 'grievanceId title status',
    })
    .lean();

  return { grievance: populated, aiAnalysis, slaPrediction, duplicates };
}

export async function getGrievanceTimeline(
  identifier: string,
  userId: string,
  userRole: UserRole,
  departmentId?: string
) {
  const grievance = await findGrievanceByIdentifier(identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  assertGrievanceAccess(grievance, toAccessContext(userId, userRole, departmentId));

  return GrievanceStatusHistory.find({ grievanceId: grievance._id })
    .populate('changedBy', 'name role')
    .sort({ createdAt: 1 })
    .lean();
}

export async function getGrievanceSla(
  identifier: string,
  userId: string,
  userRole: UserRole,
  departmentId?: string
) {
  const grievance = await findGrievanceByIdentifier(identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  assertGrievanceAccess(grievance, toAccessContext(userId, userRole, departmentId));

  const sla = await SLAPrediction.findOne({ grievanceId: grievance._id }).lean();
  if (!sla) throw new AppError('SLA prediction not found', 404);

  return sla;
}

export async function getGrievanceDuplicates(
  identifier: string,
  userId: string,
  userRole: UserRole,
  departmentId?: string
) {
  const grievance = await findGrievanceByIdentifier(identifier);
  if (!grievance) throw new AppError('Grievance not found', 404);

  assertGrievanceAccess(grievance, toAccessContext(userId, userRole, departmentId));

  return DuplicateMatch.find({ grievanceId: grievance._id })
    .populate({
      path: 'matchedGrievanceId',
      select: 'grievanceId title description status',
    })
    .sort({ similarityScore: -1 })
    .lean();
}
