import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createHeadSchema,
  createDepartmentUserSchema,
  createAdminSchema,
  changeRoleSchema,
  changeStatusSchema,
  updateUserSchema,
  reauthenticateSchema,
  softDeleteUserSchema,
  permanentDeleteUserSchema,
  resetPasswordAdminSchema,
  updateSettingsSchema,
} from '../validators/adminValidators';
import {
  platformStats,
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  createHead,
  createAdmin,
  createDepartmentUser,
  getUser,
  updateUser,
  listUsers,
  listHeads,
  updateUserStatus,
  changeUserRole,
  softDeleteUser,
  restoreUser,
  permanentDeleteUser,
  forceLogoutUser,
  resetUserPassword,
  unlockUserAccount,
  verifyUserEmailHandler,
  reauthenticate,
  globalSearch,
  auditLogs,
  securityEvents,
  securityDashboard,
  platformHealth,
  systemActivity,
  settingsGet,
  settingsUpdate,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', platformStats);
router.get('/health', platformHealth);
router.get('/activity', systemActivity);
router.get('/search', globalSearch);
router.post('/reauthenticate', validateBody(reauthenticateSchema), reauthenticate);

router.get('/settings', settingsGet);
router.patch('/settings', validateBody(updateSettingsSchema), settingsUpdate);

router.get('/audit-logs', auditLogs);
router.get('/security/events', securityEvents);
router.get('/security/dashboard', securityDashboard);

router.get('/departments', listDepartments);
router.post('/departments', validateBody(createDepartmentSchema), createDepartment);
router.get('/departments/:id', getDepartment);
router.patch('/departments/:id', validateBody(updateDepartmentSchema), updateDepartment);

router.get('/heads', listHeads);
router.post('/heads', validateBody(createHeadSchema), createHead);
router.post('/admins', validateBody(createAdminSchema), createAdmin);

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/users', validateBody(createDepartmentUserSchema), createDepartmentUser);
router.patch('/users/:id', validateBody(updateUserSchema), updateUser);
router.patch('/users/:id/status', validateBody(changeStatusSchema), updateUserStatus);
router.patch('/users/:id/role', validateBody(changeRoleSchema), changeUserRole);
router.post('/users/:id/soft-delete', validateBody(softDeleteUserSchema), softDeleteUser);
router.post('/users/:id/restore', restoreUser);
router.delete('/users/:id/permanent', validateBody(permanentDeleteUserSchema), permanentDeleteUser);
router.post('/users/:id/force-logout', forceLogoutUser);
router.post('/users/:id/reset-password', validateBody(resetPasswordAdminSchema), resetUserPassword);
router.post('/users/:id/unlock', unlockUserAccount);
router.post('/users/:id/verify-email', verifyUserEmailHandler);

export default router;
