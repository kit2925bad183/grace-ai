import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/enums';
import { headDashboard, headGrievances } from '../controllers/scopeController';

const router = Router();

router.use(authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS));

router.get('/dashboard', headDashboard);
router.get('/grievances', headGrievances);

export default router;
