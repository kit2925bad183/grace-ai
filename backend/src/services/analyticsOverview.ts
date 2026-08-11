import { Grievance, SLAPrediction, DuplicateMatch } from '../models';
import { GrievanceStatus } from '../models/enums';
const IN_PROGRESS_STATUSES = [
  GrievanceStatus.SUBMITTED,
  GrievanceStatus.AI_ANALYZED,
  GrievanceStatus.ASSIGNED,
  GrievanceStatus.UNDER_REVIEW,
  GrievanceStatus.IN_PROGRESS,
  GrievanceStatus.ESCALATED,
];

const RESOLVED_STATUSES = [GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED];

export async function getAuthorityOverview() {
  const [totalGrievances, resolved, inProgress, slaAtRisk, duplicateComplaints, avgResolution, slaComplianceResult] =
    await Promise.all([
      Grievance.countDocuments(),
      Grievance.countDocuments({ status: { $in: RESOLVED_STATUSES } }),
      Grievance.countDocuments({ status: { $in: IN_PROGRESS_STATUSES } }),
      SLAPrediction.countDocuments({
        riskPercentage: { $gte: 60 },
        grievanceId: {
          $in: await Grievance.find({ status: { $nin: RESOLVED_STATUSES } }).distinct('_id'),
        },
      }),
      DuplicateMatch.countDocuments({ status: { $ne: 'DISMISSED' } }),
      Grievance.aggregate([
        {
          $match: {
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
  return {
    totalGrievances,
    resolved,
    inProgress,
    slaCompliance,
    slaAtRisk,
    duplicateComplaints,
    averageResolutionTime: Math.round((avgResolution[0]?.avgDays ?? 0) * 10) / 10,
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
