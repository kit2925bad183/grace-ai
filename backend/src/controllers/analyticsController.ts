import { Request, Response, NextFunction } from 'express';
import {
  getAnalyticsOverview,
  getComplaintTrends,
  getDepartmentAnalytics,
  getCategoryAnalytics,
  getSlaAnalytics,
  getHotspotAnalytics,
  getPolicyImpactAnalytics,
  getRootCauseAnalytics,
  getForecastAnalytics,
  getAuthorityOverview,
} from '../services/analyticsService';
import { getSlaMonitoringList } from '../services/slaService';
import { parseAnalyticsFilters } from '../utils/analyticsFilters';
import type { AccessContext } from '../utils/accessControl';
import { UserRole } from '../models/enums';

function getFilters(req: Request) {
  const base = parseAnalyticsFilters(req.query as Record<string, unknown>);
  if (req.user?.role === UserRole.DEPARTMENT && req.user.departmentId) {
    return { ...base, department: req.user.departmentId };
  }
  return base;
}

function accessFromReq(req: Request): AccessContext | undefined {
  if (!req.user) return undefined;
  if (req.user.role === UserRole.DEPARTMENT) {
    return {
      id: req.user.id,
      role: req.user.role,
      departmentId: req.user.departmentId,
    };
  }
  return undefined;
}

export async function authorityOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAuthorityOverview(accessFromReq(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

/** Public aggregate governance metrics for the landing page (no auth). */
export async function publicGovernanceStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAuthorityOverview();
    res.json({
      success: true,
      data: {
        totalGrievances: data.totalGrievances,
        resolved: data.resolved,
        inProgress: data.inProgress,
        slaCompliance: data.slaCompliance,
        slaAtRisk: data.slaAtRisk,
        averageResolutionTime: data.averageResolutionTime,
        duplicateComplaints: data.duplicateComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function analyticsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAnalyticsOverview(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsTrends(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getComplaintTrends(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsDepartments(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getDepartmentAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getCategoryAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsSla(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSlaAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsHotspots(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getHotspotAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsForecast(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getForecastAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsRootCauses(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getRootCauseAnalytics(getFilters(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyticsPolicyImpact(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getPolicyImpactAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function slaMonitoring(req: Request, res: Response, next: NextFunction) {
  try {
    const department =
      req.user?.role === UserRole.DEPARTMENT
        ? req.user.departmentId
        : (req.query.department as string | undefined);
    const data = await getSlaMonitoringList({
      riskLevel: req.query.riskLevel as string | undefined,
      department,
      ward: req.query.ward as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      sort: req.query.sort as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
