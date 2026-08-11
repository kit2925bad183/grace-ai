import { Request, Response, NextFunction } from 'express';
import { listAllDuplicates, updateDuplicateStatus } from '../services/duplicateService';
import { DuplicateMatchStatus, UserRole } from '../models/enums';

export async function listDuplicates(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listAllDuplicates({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateDuplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await updateDuplicateStatus({
      id: req.params.id,
      status: req.body.status as DuplicateMatchStatus,
      userId: req.user!.id,
      userRole: req.user!.role as UserRole,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
