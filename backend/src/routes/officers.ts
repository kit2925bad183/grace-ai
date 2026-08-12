import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/enums';
import {
  listOfficers,
  getOfficer,
  getOfficersByDepartment,
} from '../controllers/officerController';

const router = Router();
const manageRoles = [UserRole.DEPARTMENT, UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN];

router.get(
  '/department/:departmentId',
  authenticate,
  authorize(...manageRoles),
  getOfficersByDepartment
);

router.get('/:id', authenticate, authorize(...manageRoles), getOfficer);

router.get('/', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), listOfficers);

export default router;
