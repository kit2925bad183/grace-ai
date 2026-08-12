import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import {
  updateStatusSchema,
  assignOfficerSchema,
} from '../validators/authorityValidators';
import {
  departmentDashboard,
  departmentGrievances,
  departmentMyWork,
  departmentGrievanceById,
  departmentUpdateStatus,
  departmentAssignOfficer,
  departmentSlaMonitoring,
  departmentDuplicates,
} from '../controllers/scopeController';

const router = Router();

router.use(authenticate, authorize(UserRole.DEPARTMENT));

router.get('/dashboard', departmentDashboard);
router.get('/my-work', departmentMyWork);
router.get('/grievances', departmentGrievances);
router.get('/grievances/:id', departmentGrievanceById);
router.patch(
  '/grievances/:id/status',
  validateBody(updateStatusSchema),
  departmentUpdateStatus
);
router.patch(
  '/grievances/:id/assign',
  validateBody(assignOfficerSchema),
  departmentAssignOfficer
);
router.get('/sla', departmentSlaMonitoring);
router.get('/duplicates', departmentDuplicates);

export default router;
