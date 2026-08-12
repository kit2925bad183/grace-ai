import { Grievance, SLAPrediction, DuplicateMatch, Department } from '../models';
import { GrievanceStatus, Priority } from '../models/enums';
import type { AccessContext } from '../utils/accessControl';
import { resolveDepartmentScope } from '../utils/accessControl';
import { sortByWorkPriority } from '../utils/workPriority';
const IN_PROGRESS_STATUSES = [
  GrievanceStatus.SUBMITTED,
  GrievanceStatus.AI_ANALYZED,
  GrievanceStatus.ASSIGNED,
  GrievanceStatus.UNDER_REVIEW,
  GrievanceStatus.IN_PROGRESS,
  GrievanceStatus.ESCALATED,
];

const RESOLVED_STATUSES = [GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED];

const OPEN_STATUSES = [
  GrievanceStatus.SUBMITTED,
  GrievanceStatus.AI_ANALYZED,
  GrievanceStatus.ASSIGNED,
  GrievanceStatus.UNDER_REVIEW,
  GrievanceStatus.IN_PROGRESS,
  GrievanceStatus.ESCALATED,
];

export async function getAuthorityOverview(access?: AccessContext) {
  const departmentId = access ? resolveDepartmentScope(access) : undefined;
  const baseMatch: Record<string, unknown> = departmentId ? { departmentId } : {};

  const openGrievanceIds = await Grievance.find({
    ...baseMatch,
    status: { $nin: RESOLVED_STATUSES },
  }).distinct('_id');

  const [totalGrievances, resolved, inProgress, slaAtRisk, duplicateComplaints, avgResolution, slaComplianceResult] =
    await Promise.all([
      Grievance.countDocuments(baseMatch),
      Grievance.countDocuments({ ...baseMatch, status: { $in: RESOLVED_STATUSES } }),
      Grievance.countDocuments({ ...baseMatch, status: { $in: IN_PROGRESS_STATUSES } }),
      SLAPrediction.countDocuments({
        riskPercentage: { $gte: 60 },
        grievanceId: { $in: openGrievanceIds },
      }),
      departmentId
        ? DuplicateMatch.countDocuments({
            status: { $ne: 'DISMISSED' },
            grievanceId: {
              $in: await Grievance.find(baseMatch).distinct('_id'),
            },
          })
        : DuplicateMatch.countDocuments({ status: { $ne: 'DISMISSED' } }),
      Grievance.aggregate([
        {
          $match: {
            ...baseMatch,
            status: { $in: RESOLVED_STATUSES },
            resolvedAt: { $exists: true, $ne: null },
          },
        },
        {
          $project: {
            resolutionDays: {
              $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDays: { $avg: '$resolutionDays' },
          },
        },
      ]),
      Grievance.aggregate([
        {
          $facet: {
            compliant: [
              {
                $match: {
                  ...baseMatch,
                  status: { $in: RESOLVED_STATUSES },
                  resolvedAt: { $exists: true, $ne: null },
                },
              },
              {
                $match: {
                  $expr: { $lte: ['$resolvedAt', '$slaDeadline'] },
                },
              },
              { $count: 'count' },
            ],
            applicable: [
              {
                $match: {
                  ...baseMatch,
                  status: { $in: [...RESOLVED_STATUSES, GrievanceStatus.REJECTED] },
                },
              },
              { $count: 'count' },
            ],
          },
        },
      ]),
    ]);

  const compliantCount = slaComplianceResult[0]?.compliant[0]?.count ?? 0;
  const applicableCount = slaComplianceResult[0]?.applicable[0]?.count ?? 0;
  const slaCompliance =
    applicableCount > 0 ? Math.round((compliantCount / applicableCount) * 100) : 0;

  const now = new Date();
  const openMatch = { ...baseMatch, status: { $in: OPEN_STATUSES } };

  const [
    criticalSla,
    slaBreaches,
    unassigned,
    escalated,
    duplicateClusters,
    attentionQueueRaw,
    departmentsNeedingAttention,
  ] = await Promise.all([
    SLAPrediction.countDocuments({
      riskLevel: 'CRITICAL',
      grievanceId: { $in: openGrievanceIds },
    }),
    Grievance.countDocuments({
      ...openMatch,
      slaDeadline: { $lt: now },
    }),
    Grievance.countDocuments({
      ...openMatch,
      assignedOfficerId: { $exists: false },
    }),
    Grievance.countDocuments({ ...baseMatch, status: GrievanceStatus.ESCALATED }),
    departmentId
      ? DuplicateMatch.countDocuments({
          status: 'POTENTIAL',
          grievanceId: { $in: openGrievanceIds },
        })
      : DuplicateMatch.countDocuments({ status: 'POTENTIAL' }),
    Grievance.find(openMatch)
      .populate([
        { path: 'categoryId', select: 'name' },
        { path: 'departmentId', select: 'name code' },
        { path: 'wardId', select: 'name code' },
      ])
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    departmentId
      ? 0
      : Department.aggregate([
          {
            $lookup: {
              from: 'grievances',
              localField: '_id',
              foreignField: 'departmentId',
              as: 'grievances',
            },
          },
          {
            $project: {
              name: 1,
              code: 1,
              openCount: {
                $size: {
                  $filter: {
                    input: '$grievances',
                    as: 'g',
                    cond: { $in: ['$$g.status', OPEN_STATUSES] },
                  },
                },
              },
              overdueCount: {
                $size: {
                  $filter: {
                    input: '$grievances',
                    as: 'g',
                    cond: {
                      $and: [
                        { $in: ['$$g.status', OPEN_STATUSES] },
                        { $lt: ['$$g.slaDeadline', now] },
                      ],
                    },
                  },
                },
              },
            },
          },
          { $match: { $or: [{ overdueCount: { $gt: 0 } }, { openCount: { $gt: 20 } }] } },
          { $count: 'count' },
        ]).then((r) => r[0]?.count ?? 0),
  ]);

  const queueIds = attentionQueueRaw.map((g) => g._id);
  const queueSla = await SLAPrediction.find({ grievanceId: { $in: queueIds } }).lean();
  const queueSlaMap = new Map(queueSla.map((s) => [s.grievanceId.toString(), s]));

  const enrichedQueue = attentionQueueRaw.map((g) => {
    const sla = queueSlaMap.get(g._id.toString());
    return {
      _id: g._id,
      grievanceId: g.grievanceId,
      title: g.title,
      status: g.status,
      priority: g.priority as Priority,
      slaDeadline: g.slaDeadline,
      assignedOfficerId: g.assignedOfficerId,
      createdAt: g.createdAt,
      categoryId: g.categoryId,
      departmentId: g.departmentId,
      wardId: g.wardId,
      slaRisk: sla?.riskLevel ?? null,
      slaRiskPercentage: sla?.riskPercentage ?? null,
    };
  });

  const attentionQueue = sortByWorkPriority(enrichedQueue).slice(0, 10);

  return {
    totalGrievances,
    resolved,
    inProgress,
    slaCompliance,
    slaAtRisk,
    duplicateComplaints,
    averageResolutionTime: Math.round((avgResolution[0]?.avgDays ?? 0) * 10) / 10,
    attentionRequired: {
      criticalSla,
      slaBreaches,
      unassigned,
      escalated,
      duplicateClusters,
      departmentsNeedingAttention,
    },
    attentionQueue,
  };
}

export async function createAuthorityAlertNotifications(_authorityUserId: string) {
  const slaAtRisk = await SLAPrediction.countDocuments({
    riskPercentage: { $gte: 60 },
  });
  const duplicateClusters = await DuplicateMatch.countDocuments({
    status: 'POTENTIAL',
  });

  return { slaAtRisk, duplicateClusters };
}
