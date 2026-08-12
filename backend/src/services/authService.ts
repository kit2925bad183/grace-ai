import bcrypt from 'bcrypt';
import { Response } from 'express';
import { User, IUser } from '../models/User';
import { AuthProvider, UserRole } from '../models/enums';
import { AppError } from '../middleware/errorHandler';
import { toAuthUser, AuthUser } from '../middleware/authMiddleware';
import { normalizeUserRole, isLegacyRole } from '../utils/normalizeRole';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateSecureToken, hashToken, timingSafeCompare } from '../utils/crypto';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from './emailService';
import { writeSecurityEvent } from './securityService';
import type { Request } from 'express';
import {
  LoginInput,
  RegisterInput,
  ChangePasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../validators/authValidators';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const VERIFY_TOKEN_HOURS = 24;
const RESET_TOKEN_HOURS = 1;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/;

export interface AuthSessionResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

const ADMIN_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,128}$/;

export function validatePasswordStrength(password: string): void {
  if (!PASSWORD_REGEX.test(password)) {
    throw new AppError(
      'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      400
    );
  }
}

export function validateAdminPasswordStrength(password: string): void {
  if (!ADMIN_PASSWORD_REGEX.test(password)) {
    throw new AppError(
      'Admin password must be at least 12 characters and include uppercase, lowercase, number, and special character',
      400
    );
  }
}

export async function verifyAdminPassword(userId: string, password: string): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user?.passwordHash) throw new AppError('Invalid admin password', 401);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid admin password', 401);
}

export async function establishSession(user: IUser): Promise<AuthSessionResult> {
  if (isLegacyRole(user.role)) {
    user.role = normalizeUserRole(user.role);
    await user.save();
  }

  const payload = {
    userId: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: toAuthUser(user),
  };
}

export function applySessionCookies(res: Response, session: AuthSessionResult): void {
  setAuthCookies(res, session.accessToken, session.refreshToken);
}

export async function registerUser(input: RegisterInput): Promise<{ user: AuthUser; message: string }> {
  validatePasswordStrength(input.password);

  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const verificationToken = generateSecureToken();

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: UserRole.CITIZEN,
    phone: input.phone,
    authProvider: AuthProvider.LOCAL,
    emailVerified: false,
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + VERIFY_TOKEN_HOURS * 60 * 60 * 1000),
    isActive: true,
  });

  await sendVerificationEmail(user.email, verificationToken);

  return {
    user: toAuthUser(user),
    message: 'Registration successful. Please verify your email before signing in.',
  };
}

export async function loginUser(input: LoginInput, req?: Request): Promise<AuthSessionResult> {
  const user = await User.findOne({ email: input.email, isDeleted: { $ne: true } }).select(
    '+passwordHash +refreshTokenHash'
  );

  if (!user || !user.isActive) {
    if (req) {
      await writeSecurityEvent({
        eventType: 'LOGIN_FAILURE',
        metadata: { email: input.email, reason: 'invalid_credentials' },
        req,
      });
    }
    throw new AppError('Invalid email or password', 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError('Account temporarily locked. Please try again later.', 429);
  }

  if (!user.passwordHash) {
    if (user.googleId || user.authProvider === AuthProvider.GOOGLE || user.authProvider === AuthProvider.BOTH) {
      throw new AppError(
        'This account uses Google Sign-In. Click "Continue with Google" or set a password via Forgot Password.',
        401
      );
    }
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCKOUT_MS);
      user.failedLoginAttempts = 0;
      if (req) {
        await writeSecurityEvent({
          userId: user._id.toString(),
          eventType: 'ACCOUNT_LOCKED',
          req,
        });
      }
    }
    await user.save();
    if (req) {
      await writeSecurityEvent({
        userId: user._id.toString(),
        eventType: 'LOGIN_FAILURE',
        req,
      });
    }
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.emailVerified) {
    throw new AppError('Please verify your email before signing in.', 403);
  }

  const session = await establishSession(user);
  if (req) {
    await writeSecurityEvent({
      userId: user._id.toString(),
      eventType: 'LOGIN_SUCCESS',
      req,
    });
  }
  return session;
}

export async function refreshSession(refreshToken: string): Promise<AuthSessionResult> {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.userId).select('+refreshTokenHash');

  if (!user || !user.isActive || !user.refreshTokenHash) {
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  const tokenHash = hashToken(refreshToken);
  if (!timingSafeCompare(user.refreshTokenHash, tokenHash)) {
    user.refreshTokenHash = undefined;
    await user.save();
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  if (user.role !== payload.role) {
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
    throw new AppError('Session expired. Please sign in again.', 401);
  }

  return establishSession(user);
}

export async function logoutUser(userId: string, res: Response, req?: Request): Promise<{ message: string }> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
  clearAuthCookies(res);
  if (req) {
    await writeSecurityEvent({ userId, eventType: 'LOGOUT', req });
  }
  return { message: 'Logged out successfully' };
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError('Authentication required', 401);
  }
  return toAuthUser(user);
}

export async function verifyEmailToken(token: string): Promise<{ message: string }> {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationTokenHash');

  if (!user) {
    throw new AppError('Verification link is invalid or has expired', 400);
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { message: 'Email verified successfully' };
}

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const user = await User.findOne({ email }).select('+emailVerificationTokenHash');

  if (user && !user.emailVerified) {
    const verificationToken = generateSecureToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + VERIFY_TOKEN_HOURS * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);
  }

  return {
    message: 'If an account exists and is unverified, a verification email has been sent.',
  };
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const user = await User.findOne({ email }).select('+passwordResetTokenHash');

  if (user && user.passwordHash) {
    const resetToken = generateSecureToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_HOURS * 60 * 60 * 1000);
    await user.save();
    await sendPasswordResetEmail(user.email, resetToken);
  }

  return {
    message: 'If an account exists, password reset instructions have been sent.',
  };
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  validatePasswordStrength(input.password);

  const tokenHash = hashToken(input.token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash');

  if (!user) {
    throw new AppError('Password reset link is invalid or has expired', 400);
  }

  user.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;

  if (user.authProvider === AuthProvider.GOOGLE) {
    user.authProvider = AuthProvider.BOTH;
  } else if (!user.authProvider) {
    user.authProvider = AuthProvider.LOCAL;
  }

  await user.save();

  return { message: 'Password reset successfully. You can now sign in.' };
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
  req?: Request
): Promise<{ message: string }> {
  validatePasswordStrength(input.newPassword);

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  if (!user.passwordHash) {
    throw new AppError('Set a password first or use Google Sign-In', 400);
  }

  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  user.refreshTokenHash = undefined;
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;

  if (user.googleId) {
    user.authProvider = AuthProvider.BOTH;
  }

  await user.save();
  if (req) {
    await writeSecurityEvent({ userId, eventType: 'PASSWORD_CHANGED', req });
  }
  return { message: 'Password changed successfully. Please sign in again.' };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<AuthUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Authentication required', 401);
  }

  if (input.name) user.name = input.name;
  if (input.phone !== undefined) user.phone = input.phone || undefined;
  if (input.avatar !== undefined) user.avatar = input.avatar || undefined;

  await user.save();
  return toAuthUser(user);
}
