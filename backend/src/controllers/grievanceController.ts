import { Request, Response, NextFunction } from 'express';
import * as grievanceService from '../services/grievanceService';
import { updateGrievanceStatus } from '../services/statusService';
import { assignOfficer } from '../services/assignmentService';
import { UserRole, GrievanceStatus } from '../models/enums';
import { paramAsString } from '../utils/params';
import type { AccessContext } from '../utils/accessControl';

function accessFromReq(req: Request): AccessContext {
  return {
    id: req.user!.id,
    role: req.user!.role as UserRole,
    departmentId: req.user!.departmentId,
  };
}

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getCategories();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getWards(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getWards();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function analyzeGrievance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.analyzeGrievancePreview(req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createGrievance(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.createGrievance(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getCitizenOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getCitizenOverview(req.user!.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getMyGrievances(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getMyGrievances(req.user!.id, {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getGrievanceById(req: Request, res: Response, next: NextFunction) {
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

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await grievanceService.getGrievanceTimeline(
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

export async function getSla(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await grievanceService.getGrievanceSla(
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

export async function getDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const access = accessFromReq(req);
    const data = await grievanceService.getGrievanceDuplicates(
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

export async function listGrievances(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.listGrievances(
      {
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
      },
      accessFromReq(req)
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
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

export async function assignOfficerHandler(req: Request, res: Response, next: NextFunction) {
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

export async function submitFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.submitGrievanceFeedback(
      paramAsString(req.params.id),
      req.user!.id,
      req.body
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
