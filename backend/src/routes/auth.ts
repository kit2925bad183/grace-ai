import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  register,
  me,
  logout,
  refresh,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPasswordHandler,
  changePasswordHandler,
  updateProfileHandler,
  googleAuth,
  googleCallback,
  googleTokenLogin,
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validate';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  googleTokenSchema,
  updateProfileSchema,
} from '../validators/authValidators';
import { UserRole } from '../models/enums';

const router = Router();

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many registration attempts, please try again later' },
});

const authActionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

router.post('/register', registerRateLimiter, validateBody(registerSchema), register);
router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), updateProfileHandler);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), changePasswordHandler);

router.get('/verify-email', verifyEmail);
router.post('/verify-email', validateBody(verifyEmailSchema), verifyEmail);
router.post(
  '/resend-verification',
  authActionRateLimiter,
  validateBody(resendVerificationSchema),
  resendVerification
);

router.post(
  '/forgot-password',
  authActionRateLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPasswordHandler);

router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/google/token', validateBody(googleTokenSchema), googleTokenLogin);

router.get(
  '/head-check',
  authenticate,
  authorize(UserRole.HEAD_OF_DEPARTMENTS),
  (_req, res) => {
    res.status(200).json({
      success: true,
      data: { message: 'Head access granted' },
    });
  }
);

/** @deprecated use /head-check */
router.get(
  '/authority-check',
  authenticate,
  authorize(UserRole.HEAD_OF_DEPARTMENTS),
  (_req, res) => {
    res.status(200).json({
      success: true,
      data: { message: 'Head access granted' },
    });
  }
);

export default router;
