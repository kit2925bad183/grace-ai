import { Request, Response, NextFunction } from 'express';
import * as grievanceService from '../services/grievanceService';
import { updateGrievanceStatus } from '../services/statusService';
import { assignOfficer } from '../services/assignmentService';
import { UserRole, GrievanceStatus } from '../models/enums';

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
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getGrievanceById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getGrievanceDetails(
      req.params.id,
      req.user!.id,
      req.user!.role as UserRole
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getTimeline(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getGrievanceTimeline(
      req.params.id,
      req.user!.id,
      req.user!.role as UserRole
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getSla(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getGrievanceSla(
      req.params.id,
      req.user!.id,
      req.user!.role as UserRole
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.getGrievanceDuplicates(
      req.params.id,
      req.user!.id,
      req.user!.role as UserRole
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listGrievances(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await grievanceService.listGrievances({
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
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await updateGrievanceStatus({
      identifier: req.params.id,
      newStatus: req.body.status as GrievanceStatus,
      changedBy: req.user!.id,
      comment: req.body.comment,
      userRole: req.user!.role as UserRole,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function assignOfficerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await assignOfficer({
      identifier: req.params.id,
      officerId: req.body.officerId,
      changedBy: req.user!.id,
      comment: req.body.comment,
      userRole: req.user!.role as UserRole,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
