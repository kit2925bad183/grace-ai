import { Request, Response, NextFunction } from 'express';
import { listAllDuplicates, updateDuplicateStatus } from '../services/duplicateService';
import { DuplicateMatchStatus, UserRole } from '../models/enums';
import { paramAsString } from '../utils/params';
import type { AccessContext } from '../utils/accessControl';

function accessFromReq(req: Request): AccessContext {
  return {
    id: req.user!.id,
    role: req.user!.role as UserRole,
    departmentId: req.user!.departmentId,
  };
}

export async function listDuplicates(req: Request, res: Response, next: NextFunction) {
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

export async function updateDuplicate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await updateDuplicateStatus({
      id: paramAsString(req.params.id),
      status: req.body.status as DuplicateMatchStatus,
      userId: req.user!.id,
      access: accessFromReq(req),
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
