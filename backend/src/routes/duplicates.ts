import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import { updateDuplicateSchema } from '../validators/authorityValidators';
import { listDuplicates, updateDuplicate } from '../controllers/duplicateController';

const router = Router();
const manageRoles = [UserRole.DEPARTMENT, UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN];

router.get('/', authenticate, authorize(...manageRoles), listDuplicates);

router.patch(
  '/:id',
  authenticate,
  authorize(...manageRoles),
  validateBody(updateDuplicateSchema),
  updateDuplicate
);

export default router;
