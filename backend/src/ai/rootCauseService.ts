import { Types } from 'mongoose';
import { Grievance } from '../models';
import { RESOLVED_STATUSES } from '../utils/analyticsFilters';
import type { AnalyticsFilters } from '../utils/analyticsFilters';
import { buildGrievanceMatch } from '../utils/analyticsFilters';

export interface RootCauseInsight {
  categoryId: string;
  categoryName: string;
  wardId: string;
  wardName: string;
  complaintCount: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  averageResolutionDays: number;
  slaCompliance: number;
  possibleRootCause: string;
  recommendation: string;
  insightLabel: string;
}

const ROOT_CAUSE_RULES: Record<
  string,
  { rootCause: string; recommendation: string }
> = {
  'water supply': {
    rootCause: 'Aging water distribution infrastructure',
    recommendation: 'Prioritize pipeline inspection and preventive maintenance.',
  },
  'road infrastructure': {
    rootCause: 'Road surface deterioration and deferred maintenance',
    recommendation: 'Schedule preventive road inspection and surface repairs.',
  },
  sanitation: {
    rootCause: 'Collection frequency or waste accumulation issues',
    recommendation: 'Review collection schedule and deploy additional resources.',
  },
  electricity: {
    rootCause: 'Aging electrical infrastructure or transformer overload',
    recommendation: 'Conduct grid inspection and upgrade overloaded circuits.',
  },
  'public safety': {
    rootCause: 'Deferred maintenance of safety infrastructure',
    recommendation: 'Deploy preventive maintenance for traffic and safety systems.',
  },
  'street lighting': {
    rootCause: 'Faulty fixtures or inadequate maintenance coverage',
    recommendation: 'Audit street lighting inventory and repair non-functional units.',
  },
  drainage: {
    rootCause: 'Blocked or inadequate drainage infrastructure',
    recommendation: 'Clear drainage channels and inspect flood-prone areas.',
  },
  'encroachment / illegal construction': {
    rootCause: 'Weak enforcement and monitoring in affected zones',
    recommendation: 'Increase field inspections and enforcement patrols.',
  },
  default: {
    rootCause: 'Recurring service delivery gap in this ward-category combination',
    recommendation: 'Conduct targeted field assessment and resource reallocation.',
  },
};

function getRule(categoryName: string) {
  const key = categoryName.toLowerCase();
  return ROOT_CAUSE_RULES[key] ?? ROOT_CAUSE_RULES.default;
}

export async function getRootCauseInsights(
  filters: AnalyticsFilters,
  minCount = 3
): Promise<RootCauseInsight[]> {
  const match = buildGrievanceMatch(filters);
  const dateFormat = '%Y-%m';

  const [combinations, recentTrends] = await Promise.all([
    Grievance.aggregate([
      { $match: match },
      {
        $group: {
          _id: { categoryId: '$categoryId', wardId: '$wardId' },
          complaintCount: { $sum: 1 },
          resolvedCount: {
            $sum: { $cond: [{ $in: ['$status', RESOLVED_STATUSES] }, 1, 0] },
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
        },
      },
      { $match: { complaintCount: { $gte: minCount } } },
      {
        $lookup: {
          from: 'complaintcategories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $lookup: {
          from: 'wards',
          localField: '_id.wardId',
          foreignField: '_id',
          as: 'ward',
        },
      },
      { $unwind: '$ward' },
      { $sort: { complaintCount: -1 } },
      { $limit: 20 },
    ]),
    Grievance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            categoryId: '$categoryId',
            wardId: '$wardId',
            period: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const trendMap = new Map<string, number[]>();
  for (const row of recentTrends) {
    const key = `${row._id.categoryId}-${row._id.wardId}`;
    if (!trendMap.has(key)) trendMap.set(key, []);
    trendMap.get(key)!.push(row.count);
  }

  return combinations.map((row) => {
    const key = `${row._id.categoryId}-${row._id.wardId}`;
    const counts = trendMap.get(key) ?? [];
    let trend: RootCauseInsight['trend'] = 'STABLE';
    if (counts.length >= 2) {
      const recent = counts.slice(-2);
      if (recent[1] > recent[0] * 1.1) trend = 'INCREASING';
      else if (recent[1] < recent[0] * 0.9) trend = 'DECREASING';
    }

    const rule = getRule(row.category.name);
    const slaCompliance =
      row.complaintCount > 0
        ? Math.round((row.resolvedCount / row.complaintCount) * 100)
        : 0;

    return {
      categoryId: (row._id.categoryId as Types.ObjectId).toString(),
      categoryName: row.category.name,
      wardId: (row._id.wardId as Types.ObjectId).toString(),
      wardName: row.ward.name,
      complaintCount: row.complaintCount,
      trend,
      averageResolutionDays:
        row.avgResolutionMs != null
          ? Math.round((row.avgResolutionMs / (1000 * 60 * 60 * 24)) * 10) / 10
          : 0,
      slaCompliance,
      possibleRootCause: rule.rootCause,
      recommendation: rule.recommendation,
      insightLabel: 'Rule-Based AI Insight',
    };
  });
}
