import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import { createGrievanceSchema } from '../validators/grievanceValidators';
import {
  updateStatusSchema,
  assignOfficerSchema,
} from '../validators/authorityValidators';
import {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getTimeline,
  getSla,
  getDuplicates,
  listGrievances,
  updateStatus,
  assignOfficerHandler,
} from '../controllers/grievanceController';

const router = Router();
const authorityRoles = [UserRole.AUTHORITY, UserRole.ADMIN];

router.get('/', authenticate, authorize(...authorityRoles), listGrievances);

router.get('/my', authenticate, authorize(UserRole.CITIZEN), getMyGrievances);

router.patch(
  '/:id/status',
  authenticate,
  authorize(...authorityRoles),
  validateBody(updateStatusSchema),
  updateStatus
);

router.patch(
  '/:id/assign',
  authenticate,
  authorize(...authorityRoles),
  validateBody(assignOfficerSchema),
  assignOfficerHandler
);

router.get('/:id/timeline', authenticate, getTimeline);
router.get('/:id/sla', authenticate, getSla);
router.get('/:id/duplicates', authenticate, getDuplicates);
router.get('/:id', authenticate, getGrievanceById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.CITIZEN),
  validateBody(createGrievanceSchema),
  createGrievance
);

export default router;
