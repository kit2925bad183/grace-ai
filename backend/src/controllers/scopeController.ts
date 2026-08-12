import { Request, Response, NextFunction } from 'express';
import * as grievanceService from '../services/grievanceService';
import { updateGrievanceStatus } from '../services/statusService';
import { assignOfficer } from '../services/assignmentService';
import { getAuthorityOverview } from '../services/analyticsOverview';
import { listAllDuplicates } from '../services/duplicateService';
import { getSlaMonitoringList } from '../services/slaService';
import { UserRole, GrievanceStatus } from '../models/enums';
import { paramAsString } from '../utils/params';
import type { AccessContext } from '../utils/accessControl';
import { Officer } from '../models';

function accessFromReq(req: Request): AccessContext {
  return {
    id: req.user!.id,
    role: req.user!.role as UserRole,
    departmentId: req.user!.departmentId,
  };
}

function listFilters(req: Request) {
  return {
    department: req.query.department as string | undefined,
    category: req.query.category as string | undefined,
    priority: req.query.priority as string | undefined,
    status: req.query.status as string | undefined,
    slaRisk: req.query.slaRisk as string | undefined,
    ward: req.query.ward as string | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    sort: req.query.sort as string | undefined,
    assignedOfficerId: undefined as string | undefined,
  };
}

export async function departmentDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await getAuthorityOverview(access);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentMyWork(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const officer = await Officer.findOne({ userId: access.id, active: true }).lean();
    const filters = listFilters(req);
    if (officer) {
      filters.assignedOfficerId = officer._id.toString();
    }
    filters.sort = filters.sort ?? 'smart';
    const data = await grievanceService.listGrievances(filters, access);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentGrievances(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = listFilters(req);
    filters.sort = filters.sort ?? 'smart';
    const data = await grievanceService.listGrievances(filters, accessFromReq(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentGrievanceById(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await grievanceService.getGrievanceDetails(
      paramAsString(req.params.id),
      access.id,
      access.role,
      access.departmentId
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentUpdateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await updateGrievanceStatus({
      identifier: paramAsString(req.params.id),
      newStatus: req.body.status as GrievanceStatus,
      changedBy: req.user!.id,
      comment: req.body.comment,
      access: accessFromReq(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentAssignOfficer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await assignOfficer({
      identifier: paramAsString(req.params.id),
      officerId: req.body.officerId,
      changedBy: req.user!.id,
      comment: req.body.comment,
      access: accessFromReq(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentSlaMonitoring(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await getSlaMonitoringList({
      department: access.departmentId,
      riskLevel: req.query.riskLevel as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function departmentDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listAllDuplicates(
      {
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      },
      accessFromReq(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function headDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getAuthorityOverview();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function headGrievances(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = listFilters(req);
    filters.sort = filters.sort ?? 'smart';
    const data = await grievanceService.listGrievances(filters);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
