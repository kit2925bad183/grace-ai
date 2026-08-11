import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getWards } from '../controllers/grievanceController';

const router = Router();

router.get('/', authenticate, getWards);

export default router;
