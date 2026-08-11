import { Request, Response, NextFunction } from 'express';
import { getRecommendationsAnalytics } from '../services/analyticsService';
import { parseAnalyticsFilters } from '../utils/analyticsFilters';

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseAnalyticsFilters(req.query as Record<string, unknown>);
    const data = await getRecommendationsAnalytics(filters);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
