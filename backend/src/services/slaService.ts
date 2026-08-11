import { Grievance, SLAPrediction } from '../models';
import { GrievanceStatus } from '../models/enums';

export async function getSlaMonitoringList(filters: {
  riskLevel?: string;
  department?: string;
  ward?: string;
  status?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const grievanceQuery: Record<string, unknown> = {};
  if (filters.department) grievanceQuery.departmentId = filters.department;
  if (filters.ward) grievanceQuery.wardId = filters.ward;
  if (filters.status) grievanceQuery.status = filters.status;

  if (filters.search) {
    grievanceQuery.$or = [
      { grievanceId: { $regex: filters.search, $options: 'i' } },
      { title: { $regex: filters.search, $options: 'i' } },
      { location: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const grievanceIds = await Grievance.find(grievanceQuery).distinct('_id');

  const slaQuery: Record<string, unknown> = {
    grievanceId: { $in: grievanceIds },
  };
  if (filters.riskLevel) slaQuery.riskLevel = filters.riskLevel;

  let sortOption: Record<string, 1 | -1> = { riskPercentage: -1 };
  if (filters.sort === 'deadline') sortOption = { slaDeadline: 1 };
  if (filters.sort === 'oldest') sortOption = { createdAt: 1 };

  const [predictions, total, groupedAgg] = await Promise.all([
    SLAPrediction.find(slaQuery)
      .populate({
        path: 'grievanceId',
        select: 'grievanceId title status departmentId wardId priority createdAt slaDeadline',
        populate: [
          { path: 'departmentId', select: 'name' },
          { path: 'wardId', select: 'name' },
        ],
      })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    SLAPrediction.countDocuments(slaQuery),
    SLAPrediction.aggregate([
      { $match: slaQuery },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]),
  ]);

  const groupedMap = Object.fromEntries(
    groupedAgg.map((g: { _id: string; count: number }) => [g._id, g.count])
  );

  const activeStatuses = [
    GrievanceStatus.RESOLVED,
    GrievanceStatus.CLOSED,
    GrievanceStatus.REJECTED,
  ];

  const activePredictions = predictions.filter((p) => {
    const g = p.grievanceId as unknown as { status: GrievanceStatus };
    return g && !activeStatuses.includes(g.status);
  });

  return {
    items: activePredictions,
    grouped: {
      CRITICAL: groupedMap.CRITICAL ?? 0,
      HIGH: groupedMap.HIGH ?? 0,
      MEDIUM: groupedMap.MEDIUM ?? 0,
      LOW: groupedMap.LOW ?? 0,
    },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function refreshSlaRisk(grievanceId: string) {
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) return null;

  const { computeSlaPrediction } = await import('../ai/slaPredictionService');
  const updated = computeSlaPrediction(
    grievance.priority,
    grievance.createdAt,
    grievance.slaDeadline,
    grievance.status
  );

  return SLAPrediction.findOneAndUpdate(
    { grievanceId: grievance._id },
    {
      riskLevel: updated.riskLevel,
      riskPercentage: updated.riskPercentage,
      remainingHours: updated.remainingHours,
      predictedResolutionDate: updated.predictedResolutionDate,
      recommendation: updated.recommendation,
    },
    { new: true }
  ).lean();
}
