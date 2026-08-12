import { Request, Response, NextFunction } from 'express';
import * as officerService from '../services/officerService';
import { paramAsString } from '../utils/params';
import { UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { resolveDepartmentScope } from '../utils/accessControl';

export async function listOfficers(req: Request, res: Response, next: NextFunction) {
  try {
    let departmentId = req.query.department as string | undefined;
    if (req.user?.role === UserRole.DEPARTMENT) {
      departmentId = resolveDepartmentScope({
        id: req.user.id,
        role: UserRole.DEPARTMENT,
        departmentId: req.user.departmentId,
      });
    }
    const data = await officerService.getAllOfficers(departmentId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getOfficer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await officerService.getOfficerById(paramAsString(req.params.id));
    if (req.user?.role === UserRole.DEPARTMENT) {
      const scoped = resolveDepartmentScope({
        id: req.user.id,
        role: UserRole.DEPARTMENT,
        departmentId: req.user.departmentId,
      });
      const officerDept = String(data.departmentId?._id ?? data.departmentId);
      if (officerDept !== scoped) {
        throw new AppError('You do not have permission to view this officer', 403);
      }
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getOfficersByDepartment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const requested = paramAsString(req.params.departmentId);
    if (req.user?.role === UserRole.DEPARTMENT) {
      const scoped = resolveDepartmentScope({
        id: req.user.id,
        role: UserRole.DEPARTMENT,
        departmentId: req.user.departmentId,
      });
      if (requested !== scoped) {
        throw new AppError('You do not have permission to view officers in this department', 403);
      }
    }
    const data = await officerService.getOfficersByDepartment(requested);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
