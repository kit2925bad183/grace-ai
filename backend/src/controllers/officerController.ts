import { Request, Response, NextFunction } from 'express';
import * as officerService from '../services/officerService';

export async function listOfficers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await officerService.getAllOfficers(req.query.department as string | undefined);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getOfficer(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await officerService.getOfficerById(req.params.id);
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
    const data = await officerService.getOfficersByDepartment(req.params.departmentId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
