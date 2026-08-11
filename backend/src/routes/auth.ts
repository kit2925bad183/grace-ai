import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me, logout } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '../validators/authValidators';
import { UserRole } from '../models/enums';

const router = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later',
  },
});

const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later',
  },
});

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/register', registerRateLimiter, validateBody(registerSchema), register);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

// Role-protected test endpoint for authorization verification (Phase 3)
router.get(
  '/authority-check',
  authenticate,
  authorize(UserRole.AUTHORITY, UserRole.ADMIN),
  (_req, res) => {
    res.status(200).json({
      success: true,
      data: { message: 'Authority access granted' },
    });
  }
);

export default router;
