import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { AuthProvider, UserStatus } from '../models/enums';
import { normalizeUserRole } from '../utils/normalizeRole';
import { verifyAccessToken } from '../utils/jwt';
import { ACCESS_COOKIE } from '../utils/cookies';
import { AppError } from './errorHandler';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: IUser['role'];
  departmentId?: string;
  departmentName?: string;
  phone?: string;
  avatar?: string;
  authProvider: AuthProvider;
  emailVerified: boolean;
  createdAt?: string;
}

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}
    interface Request {
      authUserDoc?: IUser;
    }
  }
}

export function toAuthUser(user: IUser): AuthUser {
  const departmentId = user.departmentId?.toString();
  const role = normalizeUserRole(user.role);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role,
    departmentId,
    phone: user.phone,
    avatar: user.avatar,
    authProvider: user.authProvider,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt?.toISOString(),
  };
}

function extractAccessToken(req: Request): string | null {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.trim()) {
    return cookieToken.trim();
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  return null;
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractAccessToken(req);
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).populate('departmentId', 'name code');

    if (
      !user ||
      user.isDeleted ||
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DISABLED ||
      !user.isActive
    ) {
      throw new AppError('Authentication required', 401);
    }

    if (user.role !== payload.role) {
      throw new AppError('Authentication required', 401);
    }

    if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
      throw new AppError('Authentication required', 401);
    }

    req.user = toAuthUser(user);
    if (user.departmentId && typeof user.departmentId === 'object' && 'name' in user.departmentId) {
      req.user.departmentName = (user.departmentId as { name: string }).name;
    }
    req.authUserDoc = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError('Authentication required', 401));
  }
}

export function authorize(...roles: IUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('Insufficient permissions', 403));
      return;
    }

    next();
  };
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError('Authentication required', 401));
    return;
  }
  if (req.user.role !== 'ADMIN') {
    next(new AppError('Admin access required', 403));
    return;
  }
  next();
}

export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user?.emailVerified) {
    next(new AppError('Email verification required', 403));
    return;
  }
  next();
}
