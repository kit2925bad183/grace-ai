import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/enums';
import {
  listOfficers,
  getOfficer,
  getOfficersByDepartment,
} from '../controllers/officerController';

const router = Router();
const authorityRoles = [UserRole.AUTHORITY, UserRole.ADMIN];

router.get(
  '/department/:departmentId',
  authenticate,
  authorize(...authorityRoles),
  getOfficersByDepartment
);

router.get('/:id', authenticate, authorize(...authorityRoles), getOfficer);

router.get('/', authenticate, authorize(...authorityRoles), listOfficers);

export default router;
