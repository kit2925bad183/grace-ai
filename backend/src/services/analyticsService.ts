import {
  Grievance,
  SLAPrediction,
  DuplicateMatch,
  PolicyImpact,
} from '../models';
import { GrievanceStatus, Priority } from '../models/enums';
import {
  AnalyticsFilters,
  buildGrievanceMatch,
  IN_PROGRESS_STATUSES,
  RESOLVED_STATUSES,
} from '../utils/analyticsFilters';
import { getRootCauseInsights } from '../ai/rootCauseService';
import { generateForecast } from '../ai/forecastService';
import { getGovernanceRecommendations } from '../ai/governanceRecommendationService';

export { getAuthorityOverview, createAuthorityAlertNotifications } from './analyticsOverview';

async function countFilteredDuplicates(match: Record<string, unknown>): Promise<number> {
  const grievanceIds = await Grievance.find(match).distinct('_id');
  if (grievanceIds.length === 0) return 0;

  return DuplicateMatch.countDocuments({
    status: { $ne: 'DISMISSED' },
    $or: [
      { grievanceId: { $in: grievanceIds } },
      { matchedGrievanceId: { $in: grievanceIds } },
    ],
  });
}

export async function getAnalyticsOverview(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);

  const [facetResult, slaAtRisk, duplicateCount] = await Promise.all([
    Grievance.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalGrievances: { $sum: 1 },
                submitted: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', [GrievanceStatus.SUBMITTED, GrievanceStatus.AI_ANALYZED]] },
                      1,
                      0,
                    ],
                  },
                },
                inProgress: {
                  $sum: {
                    $cond: [{ $in: ['$status', IN_PROGRESS_STATUSES] }, 1, 0],
                  },
                },
                resolved: {
                  $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.RESOLVED] }, 1, 0] },
                },
                closed: {
                  $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.CLOSED] }, 1, 0] },
                },
                escalated: {
                  $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.ESCALATED] }, 1, 0] },
                },
                rejected: {
                  $sum: { $cond: [{ $eq: ['$status', GrievanceStatus.REJECTED] }, 1, 0] },
                },
                highPriority: {
                  $sum: { $cond: [{ $eq: ['$priority', Priority.HIGH] }, 1, 0] },
                },
                criticalPriority: {
                  $sum: { $cond: [{ $eq: ['$priority', Priority.CRITICAL] }, 1, 0] },
                },
              },
            },
          ],
          resolution: [
            {
              $match: {
                status: { $in: RESOLVED_STATUSES },
                resolvedAt: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: null,
                avgMs: { $avg: { $subtract: ['$resolvedAt', '$createdAt'] } },
              },
            },
          ],
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
    SLAPrediction.countDocuments({
      riskPercentage: { $gte: 60 },
      grievanceId: {
        $in: await Grievance.find({
          ...match,
          status: { $nin: RESOLVED_STATUSES },
        }).distinct('_id'),
      },
    }),
    countFilteredDuplicates(match),
  ]);

  const totals = facetResult[0]?.totals[0] ?? {};
  const resolution = facetResult[0]?.resolution[0];
  const compliantCount = facetResult[0]?.compliant[0]?.count ?? 0;
  const applicableCount = facetResult[0]?.applicable[0]?.count ?? 0;

  const totalGrievances = totals.totalGrievances ?? 0;
  const resolvedTotal = (totals.resolved ?? 0) + (totals.closed ?? 0);
  const avgHours = resolution?.avgMs
    ? Math.round((resolution.avgMs / (1000 * 60 * 60)) * 10) / 10
    : 0;
  const avgDays = resolution?.avgMs
    ? Math.round((resolution.avgMs / (1000 * 60 * 60 * 24)) * 10) / 10
    : 0;

  const slaCompliance =
    applicableCount > 0 ? Math.round((compliantCount / applicableCount) * 100) : 0;

  return {
    totalGrievances,
    submitted: totals.submitted ?? 0,
    inProgress: totals.inProgress ?? 0,
    resolved: totals.resolved ?? 0,
    closed: totals.closed ?? 0,
    escalated: totals.escalated ?? 0,
    rejected: totals.rejected ?? 0,
    slaAtRisk,
    slaCompliance,
    averageResolutionHours: avgHours,
    averageResolutionDays: avgDays,
    highPriority: totals.highPriority ?? 0,
    criticalPriority: totals.criticalPriority ?? 0,
    duplicateCount,
    resolvedTotal,
  };
}

export async function getComplaintTrends(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);
  const dateFormat = filters.period === 'daily' ? '%Y-%m-%d' : '%Y-%m';

  const [overall, byCategory] = await Promise.all([
    Grievance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: '$_id', count: 1 } },
    ]),
    Grievance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            period: { $dateToString: { format: dateFormat, date: '$createdAt' } },
            categoryId: '$categoryId',
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'complaintcategories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { '_id.period': 1 } },
      {
        $group: {
          _id: '$_id.period',
          categories: {
            $push: {
              categoryName: '$category.name',
              categoryId: '$_id.categoryId',
              count: '$count',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, period: '$_id', categories: 1 } },
    ]),
  ]);

  return { trends: overall, categoryTrends: byCategory, period: filters.period ?? 'monthly' };
}

export async function getDepartmentAnalytics(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);

  const departments = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$departmentId',
        totalComplaints: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $in: ['$status', RESOLVED_STATUSES] }, 1, 0] },
        },
        inProgress: {
          $sum: { $cond: [{ $in: ['$status', IN_PROGRESS_STATUSES] }, 1, 0] },
        },
        unresolved: {
          $sum: { $cond: [{ $nin: ['$status', RESOLVED_STATUSES] }, 1, 0] },
        },
        highPriority: {
          $sum: { $cond: [{ $eq: ['$priority', Priority.HIGH] }, 1, 0] },
        },
        criticalPriority: {
          $sum: { $cond: [{ $eq: ['$priority', Priority.CRITICAL] }, 1, 0] },
        },
        avgResolutionMs: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', RESOLVED_STATUSES] },
                  { $ne: ['$resolvedAt', null] },
                ],
              },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null,
            ],
          },
        },
        compliant: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', RESOLVED_STATUSES] },
                  { $ne: ['$resolvedAt', null] },
                  { $lte: ['$resolvedAt', '$slaDeadline'] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'department',
      },
    },
    { $unwind: '$department' },
    {
      $project: {
        departmentId: '$_id',
        departmentName: '$department.name',
        departmentCode: '$department.code',
        totalComplaints: 1,
        resolved: 1,
        inProgress: 1,
        unresolved: 1,
        highPriority: 1,
        criticalPriority: 1,
        averageResolutionTime: {
          $cond: [
            { $gt: ['$avgResolutionMs', null] },
            { $round: [{ $divide: ['$avgResolutionMs', 1000 * 60 * 60 * 24] }, 1] },
            0,
          ],
        },
        slaCompliance: {
          $cond: [
            { $gt: ['$totalComplaints', 0] },
            { $round: [{ $multiply: [{ $divide: ['$compliant', '$totalComplaints'] }, 100] }, 0] },
            0,
          ],
        },
      },
    },
    { $sort: { totalComplaints: -1 } },
  ]);

  return {
    departments,
    rankings: {
      highestVolume: departments[0] ?? null,
      bestSla: [...departments].sort((a, b) => b.slaCompliance - a.slaCompliance)[0] ?? null,
      longestResolution: [...departments]
        .filter((d) => d.averageResolutionTime > 0)
        .sort((a, b) => b.averageResolutionTime - a.averageResolutionTime)[0] ?? null,
      highestUnresolved: [...departments].sort((a, b) => b.unresolved - a.unresolved)[0] ?? null,
    },
  };
}

export async function getCategoryAnalytics(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);

  const [categories, priorityDistribution, totalCount] = await Promise.all([
    Grievance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$categoryId',
          complaintCount: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $in: ['$status', RESOLVED_STATUSES] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', Priority.HIGH] }, 1, 0] },
          },
          criticalPriority: {
            $sum: { $cond: [{ $eq: ['$priority', Priority.CRITICAL] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'complaintcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { complaintCount: -1 } },
    ]),
    Grievance.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $project: { _id: 0, priority: '$_id', count: 1 } },
    ]),
    Grievance.countDocuments(match),
  ]);

  const categoryResults = categories.map((c) => ({
    categoryId: c._id,
    categoryName: c.category.name,
    complaintCount: c.complaintCount,
    percentage: totalCount > 0 ? Math.round((c.complaintCount / totalCount) * 1000) / 10 : 0,
    resolved: c.resolved,
    unresolved: c.complaintCount - c.resolved,
    highPriority: c.highPriority,
    criticalPriority: c.criticalPriority,
  }));

  return { categories: categoryResults, priorityDistribution, totalCount };
}

export async function getSlaAnalytics(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);
  const grievanceIds = await Grievance.find(match).distinct('_id');

  const [riskCounts, overdue, compliantAgg, totalPredictions] = await Promise.all([
    SLAPrediction.aggregate([
      { $match: { grievanceId: { $in: grievanceIds } } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } },
    ]),
    Grievance.countDocuments({
      ...match,
      status: { $nin: RESOLVED_STATUSES },
      slaDeadline: { $lt: new Date() },
    }),
    Grievance.aggregate([
      {
        $match: {
          ...match,
          status: { $in: RESOLVED_STATUSES },
          resolvedAt: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          compliant: {
            $sum: { $cond: [{ $lte: ['$resolvedAt', '$slaDeadline'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]),
    SLAPrediction.countDocuments({ grievanceId: { $in: grievanceIds } }),
  ]);

  const riskMap = Object.fromEntries(riskCounts.map((r) => [r._id, r.count]));
  const compliant = compliantAgg[0]?.compliant ?? 0;
  const resolvedTotal = compliantAgg[0]?.total ?? 0;

  return {
    total: totalPredictions,
    low: riskMap.LOW ?? 0,
    medium: riskMap.MEDIUM ?? 0,
    high: riskMap.HIGH ?? 0,
    critical: riskMap.CRITICAL ?? 0,
    overdue,
    compliant,
    compliancePercentage: resolvedTotal > 0 ? Math.round((compliant / resolvedTotal) * 100) : 0,
  };
}

export async function getHotspotAnalytics(filters: AnalyticsFilters) {
  const match = buildGrievanceMatch(filters);

  const wards = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$wardId',
        complaintCount: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $in: ['$status', RESOLVED_STATUSES] }, 1, 0] },
        },
        highPriorityCount: {
          $sum: {
            $cond: [
              { $in: ['$priority', [Priority.HIGH, Priority.CRITICAL]] },
              1,
              0,
            ],
          },
        },
        avgResolutionMs: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', RESOLVED_STATUSES] },
                  { $ne: ['$resolvedAt', null] },
                ],
              },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null,
            ],
          },
        },
        compliant: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', RESOLVED_STATUSES] },
                  { $ne: ['$resolvedAt', null] },
                  { $lte: ['$resolvedAt', '$slaDeadline'] },
                ],
              },
              1,
              0,
            ],
          },
        },
        categories: { $push: '$categoryId' },
      },
    },
    {
      $lookup: {
        from: 'wards',
        localField: '_id',
        foreignField: '_id',
        as: 'ward',
      },
    },
    { $unwind: '$ward' },
    { $sort: { complaintCount: -1 } },
  ]);

  const categoryCountsByWard = await Grievance.aggregate([
    { $match: match },
    { $group: { _id: { wardId: '$wardId', categoryId: '$categoryId' }, count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'complaintcategories',
        localField: '_id.categoryId',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    { $sort: { count: -1 } },
  ]);

  const topCategoryMap = new Map<string, string>();
  for (const row of categoryCountsByWard) {
    const wardKey = row._id.wardId.toString();
    if (!topCategoryMap.has(wardKey)) {
      topCategoryMap.set(wardKey, row.category.name);
    }
  }

  const maxCount = wards[0]?.complaintCount ?? 1;

  return wards.map((w) => {
    const wardKey = w._id.toString();
    const intensity =
      w.complaintCount >= maxCount * 0.7
        ? 'HIGH'
        : w.complaintCount >= maxCount * 0.35
          ? 'MEDIUM'
          : 'LOW';

    return {
      wardId: w._id,
      wardName: w.ward.name,
      wardCode: w.ward.code,
      complaintCount: w.complaintCount,
      topCategory: topCategoryMap.get(wardKey) ?? 'N/A',
      averageResolutionTime:
        w.avgResolutionMs != null
          ? Math.round((w.avgResolutionMs / (1000 * 60 * 60 * 24)) * 10) / 10
          : 0,
      slaCompliance:
        w.complaintCount > 0 ? Math.round((w.compliant / w.complaintCount) * 100) : 0,
      highPriorityCount: w.highPriorityCount,
      intensity,
      activityLabel:
        intensity === 'HIGH'
          ? 'High Activity'
          : intensity === 'MEDIUM'
            ? 'Medium Activity'
            : 'Low Activity',
    };
  });
}

export async function getPolicyImpactAnalytics() {
  const policies = await PolicyImpact.find()
    .populate('departmentId', 'name code')
    .populate('categoryId', 'name')
    .sort({ effectiveDate: -1 })
    .lean();

  return policies.map((p) => {
    const complaintChange =
      p.beforeComplaintsPerMonth > 0
        ? Math.round(
            ((p.afterComplaintsPerMonth - p.beforeComplaintsPerMonth) /
              p.beforeComplaintsPerMonth) *
              1000
          ) / 10
        : 0;
    const slaImprovement = Math.round((p.slaAfter - p.slaBefore) * 10) / 10;

    return {
      _id: p._id,
      policyName: p.policyName,
      description: p.description,
      department: p.departmentId,
      category: p.categoryId,
      beforeComplaintsPerMonth: p.beforeComplaintsPerMonth,
      afterComplaintsPerMonth: p.afterComplaintsPerMonth,
      complaintChangePercent: complaintChange,
      slaBefore: p.slaBefore,
      slaAfter: p.slaAfter,
      slaImprovementPercent: slaImprovement,
      impactPercentage: p.impactPercentage,
      effectiveDate: p.effectiveDate,
      isDemoSeed: p.isDemoSeed,
      label: p.isDemoSeed ? 'Seeded Policy Example' : 'Policy Impact Record',
    };
  });
}

export async function getRootCauseAnalytics(filters: AnalyticsFilters) {
  return getRootCauseInsights(filters);
}

export async function getForecastAnalytics(filters: AnalyticsFilters) {
  return generateForecast(filters);
}

export async function getRecommendationsAnalytics(filters: AnalyticsFilters) {
  return getGovernanceRecommendations(filters);
}
