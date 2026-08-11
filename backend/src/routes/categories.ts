import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getCategories } from '../controllers/grievanceController';

const router = Router();

router.get('/', authenticate, getCategories);

export default router;
