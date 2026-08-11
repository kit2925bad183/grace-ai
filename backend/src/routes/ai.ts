import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { UserRole } from '../models/enums';
import { analyzeGrievanceSchema } from '../validators/grievanceValidators';
import { analyzeGrievance } from '../controllers/grievanceController';
import { getRecommendations } from '../controllers/aiController';

const router = Router();
const authorityRoles = [UserRole.AUTHORITY, UserRole.ADMIN];

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
  authorize(...authorityRoles),
  getRecommendations
);

export default router;
