import { GrievanceStatus } from '../models/enums';
import { AppError } from '../middleware/errorHandler';

export interface AnalyticsFilters {
  from?: Date;
  to?: Date;
  department?: string;
  category?: string;
  ward?: string;
  priority?: string;
  status?: string;
  period?: 'monthly' | 'daily';
}

export function parseAnalyticsFilters(query: Record<string, unknown>): AnalyticsFilters {
  const from = query.from ? new Date(String(query.from)) : undefined;
  const to = query.to ? new Date(String(query.to)) : undefined;

  if (from && Number.isNaN(from.getTime())) {
    throw new AppError('Invalid from date', 400);
  }
  if (to && Number.isNaN(to.getTime())) {
    throw new AppError('Invalid to date', 400);
  }
  if (from && to && from > to) {
    throw new AppError('from date must be before to date', 400);
  }

  const period = query.period === 'daily' ? 'daily' : 'monthly';

  return {
    from,
    to,
    department: query.department ? String(query.department) : undefined,
    category: query.category ? String(query.category) : undefined,
    ward: query.ward ? String(query.ward) : undefined,
    priority: query.priority ? String(query.priority) : undefined,
    status: query.status ? String(query.status) : undefined,
    period,
  };
}

export function buildGrievanceMatch(filters: AnalyticsFilters): Record<string, unknown> {
  const match: Record<string, unknown> = {};

  if (filters.from || filters.to) {
    match.createdAt = {};
    if (filters.from) (match.createdAt as Record<string, Date>).$gte = filters.from;
    if (filters.to) (match.createdAt as Record<string, Date>).$lte = filters.to;
  }
  if (filters.department) match.departmentId = filters.department;
  if (filters.category) match.categoryId = filters.category;
  if (filters.ward) match.wardId = filters.ward;
  if (filters.priority) match.priority = filters.priority;
  if (filters.status) match.status = filters.status;

  return match;
}

export const RESOLVED_STATUSES = [GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED];

export const IN_PROGRESS_STATUSES = [
  GrievanceStatus.SUBMITTED,
  GrievanceStatus.AI_ANALYZED,
  GrievanceStatus.ASSIGNED,
  GrievanceStatus.UNDER_REVIEW,
  GrievanceStatus.IN_PROGRESS,
  GrievanceStatus.ESCALATED,
];
