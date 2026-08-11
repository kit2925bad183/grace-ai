import { Grievance } from '../models';
import type { AnalyticsFilters } from '../utils/analyticsFilters';
import { buildGrievanceMatch } from '../utils/analyticsFilters';

export interface ForecastPoint {
  period: string;
  count?: number;
  predicted?: number;
}

export interface CategoryForecast {
  categoryId: string;
  categoryName: string;
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  method: string;
  insufficientData: boolean;
}

export interface ForecastResult {
  historical: ForecastPoint[];
  forecast: ForecastPoint[];
  method: string;
  categoryForecasts: CategoryForecast[];
}

const MIN_HISTORICAL_POINTS = 3;
const FORECAST_PERIODS = 3;
const METHOD = 'MOVING_AVERAGE_DEMO';

function addMonths(period: string, months: number): string {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(year, month - 1 + months, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function movingAverage(values: number[], window = 3): number {
  if (values.length === 0) return 0;
  const slice = values.slice(-window);
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}

async function getMonthlyCounts(match: Record<string, unknown>) {
  return Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
}

export async function generateForecast(filters: AnalyticsFilters): Promise<ForecastResult> {
  const match = buildGrievanceMatch(filters);
  const monthlyData = await getMonthlyCounts(match);

  const historical: ForecastPoint[] = monthlyData.map((row) => ({
    period: row._id as string,
    count: row.count as number,
  }));

  const counts = historical.map((h) => h.count ?? 0);
  const forecast: ForecastPoint[] = [];

  if (counts.length >= MIN_HISTORICAL_POINTS) {
    let lastPeriod = historical[historical.length - 1].period;
    let workingCounts = [...counts];

    for (let i = 0; i < FORECAST_PERIODS; i++) {
      lastPeriod = addMonths(lastPeriod, 1);
      const predicted = movingAverage(workingCounts);
      forecast.push({ period: lastPeriod, predicted });
      workingCounts.push(predicted);
    }
  }

  const categoryData = await Grievance.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          categoryId: '$categoryId',
          period: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
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
  ]);

  const byCategory = new Map<
    string,
    { name: string; points: ForecastPoint[] }
  >();

  for (const row of categoryData) {
    const id = (row._id.categoryId as { toString(): string }).toString();
    if (!byCategory.has(id)) {
      byCategory.set(id, { name: row.category.name, points: [] });
    }
    byCategory.get(id)!.points.push({
      period: row._id.period,
      count: row.count,
    });
  }

  const priorityCategories = ['Water Supply', 'Road Infrastructure', 'Sanitation', 'Electricity'];

  const categoryForecasts: CategoryForecast[] = [];

  for (const [categoryId, data] of byCategory) {
    const isPriority = priorityCategories.some((name) =>
      data.name.toLowerCase().includes(name.toLowerCase())
    );
    if (!isPriority && data.points.length < MIN_HISTORICAL_POINTS) continue;

    const catCounts = data.points.map((p) => p.count ?? 0);
    const insufficientData = catCounts.length < MIN_HISTORICAL_POINTS;
    const catForecast: ForecastPoint[] = [];

    if (!insufficientData) {
      let lastPeriod = data.points[data.points.length - 1].period;
      let working = [...catCounts];
      for (let i = 0; i < FORECAST_PERIODS; i++) {
        lastPeriod = addMonths(lastPeriod, 1);
        const predicted = movingAverage(working);
        catForecast.push({ period: lastPeriod, predicted });
        working.push(predicted);
      }
    }

    categoryForecasts.push({
      categoryId,
      categoryName: data.name,
      historical: data.points,
      forecast: catForecast,
      method: METHOD,
      insufficientData,
    });
  }

  categoryForecasts.sort((a, b) => {
    const aTotal = a.historical.reduce((s, p) => s + (p.count ?? 0), 0);
    const bTotal = b.historical.reduce((s, p) => s + (p.count ?? 0), 0);
    return bTotal - aTotal;
  });

  return {
    historical,
    forecast,
    method: METHOD,
    categoryForecasts: categoryForecasts.slice(0, 6),
  };
}
