import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import { analyzeGrievanceSchema } from '../validators/grievanceValidators';
import { analyzeGrievance } from '../controllers/grievanceController';
import { getRecommendations } from '../controllers/aiController';

const router = Router();
const manageRoles = [UserRole.DEPARTMENT, UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN];

router.post(
  '/analyze-grievance',
  authenticate,
  authorize(UserRole.CITIZEN),
  validateBody(analyzeGrievanceSchema),
  analyzeGrievance
);

router.get(
  '/recommendations',
  authenticate,
  authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN),
  getRecommendations
);

export default router;
