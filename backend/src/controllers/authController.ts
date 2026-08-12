import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import {
  loginUser,
  registerUser,
  getUserById,
  logoutUser,
  refreshSession,
  verifyEmailToken,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  updateProfile,
  applySessionCookies,
  type AuthSessionResult,
} from '../services/authService';
import {
  completeGoogleLogin,
  verifyGoogleIdToken,
} from '../services/googleAuthService';
import { env, isGoogleOAuthConfigured } from '../config/env';
import { getRoleDashboardPath } from '../utils/roles';
import { REFRESH_COOKIE } from '../utils/cookies';
import { User } from '../models/User';

function sendSession(res: Response, session: AuthSessionResult): void {
  applySessionCookies(res, session);
  res.status(200).json({
    success: true,
    data: { user: session.user },
  });
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginUser(req.body, req);
    sendSession(res, result);
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isRegistrationEnabled } = await import('../services/platformSettingsService');
    if (!(await isRegistrationEnabled())) {
      res.status(503).json({ success: false, message: 'Registration is currently disabled.' });
      return;
    }
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Session expired. Please sign in again.' });
      return;
    }

    const session = await refreshSession(refreshToken);
    sendSession(res, session);
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await getUserById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    const result = userId
      ? await logoutUser(userId, res, req)
      : { message: 'Logged out successfully' };
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = (req.query.token as string) || req.body.token;
    const result = await verifyEmailToken(token);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await resendVerificationEmail(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await requestPasswordReset(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await resetPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await changePassword(req.user.id, req.body, req);
    await logoutUser(req.user.id, res, req);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export function googleAuth(_req: Request, res: Response, next: NextFunction): void {
  if (!isGoogleOAuthConfigured()) {
    res.status(503).json({ success: false, message: 'Google Sign-In is not configured' });
    return;
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(_req, res, next);
}

export function googleCallback(req: Request, res: Response, next: NextFunction): void {
  if (!isGoogleOAuthConfigured()) {
    res.redirect(`${env.clientUrl}/login?error=google_not_configured`);
    return;
  }

  passport.authenticate('google', { session: false }, async (err: Error | null, user: Express.User | false) => {
    try {
      if (err || !user) {
        res.redirect(`${env.clientUrl}/login?error=google_auth_failed`);
        return;
      }

      const dbUser = await User.findById(user.id);
      if (!dbUser) {
        res.redirect(`${env.clientUrl}/login?error=google_auth_failed`);
        return;
      }

      const session = await completeGoogleLogin(dbUser);
      applySessionCookies(res, session);
      res.redirect(`${env.clientUrl}${getRoleDashboardPath(dbUser.role)}`);
    } catch {
      res.redirect(`${env.clientUrl}/login?error=google_auth_failed`);
    }
  })(req, res, next);
}

export async function googleTokenLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await verifyGoogleIdToken(req.body.credential);
    const session = await completeGoogleLogin(user);
    sendSession(res, session);
  } catch (error) {
    next(error);
  }
}
