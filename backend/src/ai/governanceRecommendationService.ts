import { AIRecommendation, Grievance } from '../models';
import { AnalysisMethod, Priority } from '../models/enums';
import { getRootCauseInsights } from './rootCauseService';
import type { AnalyticsFilters } from '../utils/analyticsFilters';
import { buildGrievanceMatch } from '../utils/analyticsFilters';

const INSIGHT_LABEL = 'AI-Generated Demo Recommendation';

async function buildEvidence(categoryName: string, wardName: string, count: number, trend: string) {
  return `High complaint concentration (${count} grievances) in ${wardName} for ${categoryName}. Trend: ${trend.replace('_', ' ').toLowerCase()}.`;
}

export async function syncGovernanceRecommendations(filters: AnalyticsFilters = {}) {
  const insights = await getRootCauseInsights(filters, 2);

  const match = buildGrievanceMatch(filters);
  const categoryTotals = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0],
          },
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
  ]);

  const upserted = [];

  for (const insight of insights.slice(0, 8)) {
    const evidence = await buildEvidence(
      insight.categoryName,
      insight.wardName,
      insight.complaintCount,
      insight.trend
    );

    const title = `${insight.categoryName} — ${insight.wardName}`;
    const priority =
      insight.complaintCount >= 10
        ? Priority.CRITICAL
        : insight.complaintCount >= 6
          ? Priority.HIGH
          : Priority.MEDIUM;

    const doc = await AIRecommendation.findOneAndUpdate(
      {
        categoryId: insight.categoryId,
        wardId: insight.wardId,
        source: AnalysisMethod.RULE_BASED_DEMO,
      },
      {
        title,
        categoryId: insight.categoryId,
        wardId: insight.wardId,
        recommendation: insight.recommendation,
        description: insight.possibleRootCause,
        evidence,
        priority,
        source: AnalysisMethod.RULE_BASED_DEMO,
        insightLabel: INSIGHT_LABEL,
        isActive: true,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    )
      .populate('categoryId', 'name')
      .populate('wardId', 'name code')
      .populate('departmentId', 'name code')
      .lean();

    upserted.push(doc);
  }

  for (const row of categoryTotals) {
    if (row.count < 5) continue;
    const compliance = row.count > 0 ? Math.round((row.resolved / row.count) * 100) : 0;
    if (compliance < 70) continue;

    const categoryName = row.category.name as string;
    const title = `${categoryName} — Maintain Current Allocation`;
    const recommendation = `${categoryName} SLA compliance at ${compliance}%. Maintain current resource allocation.`;
    const evidence = `Category-wide SLA compliance is ${compliance}% across ${row.count} grievances.`;

    const doc = await AIRecommendation.findOneAndUpdate(
      {
        categoryId: row._id,
        wardId: { $exists: false },
        title: { $regex: 'Maintain Current Allocation', $options: 'i' },
        source: AnalysisMethod.RULE_BASED_DEMO,
      },
      {
        title,
        categoryId: row._id,
        recommendation,
        description: `Improving SLA compliance for ${categoryName}`,
        evidence,
        priority: Priority.MEDIUM,
        source: AnalysisMethod.RULE_BASED_DEMO,
        insightLabel: INSIGHT_LABEL,
        isActive: true,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    )
      .populate('categoryId', 'name')
      .populate('wardId', 'name code')
      .populate('departmentId', 'name code')
      .lean();

    upserted.push(doc);
  }

  return upserted;
}

export async function getGovernanceRecommendations(filters: AnalyticsFilters = {}) {
  await syncGovernanceRecommendations(filters);

  return AIRecommendation.find({ isActive: true })
    .populate('categoryId', 'name')
    .populate('wardId', 'name code')
    .populate('departmentId', 'name code')
    .sort({ generatedAt: -1 })
    .limit(20)
    .lean();
}
