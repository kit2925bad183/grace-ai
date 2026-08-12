import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/adminService';
import { verifyAdminPassword } from '../services/authService';
import {
  getPlatformSettings,
  updatePlatformSettings,
} from '../services/platformSettingsService';
import {
  listSecurityEvents,
  getSecurityDashboardStats,
} from '../services/securityService';
import { UserRole, UserStatus } from '../models/enums';
import { paramAsString } from '../utils/params';

export async function platformStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPlatformStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listDepartments(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listDepartments();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getDepartmentById(paramAsString(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createDepartment(req.body, req.user!.id, req);
    res.status(201).json({ success: true, data, message: 'Department created successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateDepartment(
      paramAsString(req.params.id),
      req.body,
      req.user!.id,
      req
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createHead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createHead(req.body, req.user!.id, req);
    res.status(201).json({ success: true, data, message: 'Department Head account created successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function createAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { adminPassword, ...input } = req.body;
    const data = await adminService.createAdminUser(input, req.user!.id, adminPassword, req);
    res.status(201).json({ success: true, data, message: 'Platform administrator created successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function createDepartmentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.createDepartmentUser(req.body, req.user!.id, req);
    res.status(201).json({ success: true, data, message: 'Department user created successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getUserById(paramAsString(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateUser(
      paramAsString(req.params.id),
      req.body,
      req.user!.id,
      req
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listUsers({
      role: req.query.role as string | undefined,
      status: req.query.status as string | undefined,
      departmentId: req.query.departmentId as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      includeDeleted: req.query.includeDeleted === 'true',
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function listHeads(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listHeads();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.updateUserStatus(
      paramAsString(req.params.id),
      req.body.status as UserStatus,
      req.user!.id,
      req
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function changeUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.changeUserRole(
      paramAsString(req.params.id),
      req.body.role as UserRole,
      req.body.departmentId,
      req.user!.id,
      req
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function softDeleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.softDeleteUser(
      paramAsString(req.params.id),
      req.body.reason,
      req.user!.id,
      req
    );
    res.json({ success: true, data, message: 'User archived successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function restoreUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.restoreUser(paramAsString(req.params.id), req.user!.id, req);
    res.json({ success: true, data, message: 'User restored successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function permanentDeleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.permanentDeleteUser(
      paramAsString(req.params.id),
      req.user!.id,
      req.body.adminPassword,
      req.body.confirmation,
      req
    );
    res.json({ success: true, data, message: 'User permanently deleted.' });
  } catch (error) {
    next(error);
  }
}

export async function forceLogoutUser(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.forceLogoutUser(paramAsString(req.params.id), req.user!.id, req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.adminResetPassword(
      paramAsString(req.params.id),
      req.body.newPassword,
      req.user!.id,
      req
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function unlockUserAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.unlockUser(paramAsString(req.params.id), req.user!.id, req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function verifyUserEmailHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.verifyUserEmail(paramAsString(req.params.id), req.user!.id, req);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function reauthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    await verifyAdminPassword(req.user!.id, req.body.password);
    res.json({ success: true, data: { verified: true } });
  } catch (error) {
    next(error);
  }
}

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.globalSearch(
      (req.query.q as string) || '',
      req.query.page ? parseInt(req.query.page as string, 10) : 1,
      req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    );
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function auditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.listAuditLogs({
      action: req.query.action as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function securityEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listSecurityEvents({
      eventType: req.query.eventType as string | undefined,
      userId: req.query.userId as string | undefined,
      severity: req.query.severity as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function securityDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getSecurityDashboardStats();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function platformHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getPlatformHealth();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function systemActivity(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await adminService.getSystemActivity();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function settingsGet(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getPlatformSettings();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function settingsUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await updatePlatformSettings(req.body, req.user!.id, req);
    res.json({ success: true, data, message: 'Settings updated successfully.' });
  } catch (error) {
    next(error);
  }
}
