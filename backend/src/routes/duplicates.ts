import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import { updateDuplicateSchema } from '../validators/authorityValidators';
import { listDuplicates, updateDuplicate } from '../controllers/duplicateController';

const router = Router();
const authorityRoles = [UserRole.AUTHORITY, UserRole.ADMIN];

router.get('/', authenticate, authorize(...authorityRoles), listDuplicates);

router.patch(
  '/:id',
  authenticate,
  authorize(...authorityRoles),
  validateBody(updateDuplicateSchema),
  updateDuplicate
);

export default router;
