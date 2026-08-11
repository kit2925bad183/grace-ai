import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { UserRole } from '../models/enums';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      authUserDoc?: IUser;
    }
  }
}

export function toAuthUser(user: IUser): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    createdAt: user.createdAt?.toISOString(),
  };
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError('Authentication required', 401);
    }

    if (user.role !== payload.role) {
      throw new AppError('Authentication required', 401);
    }

    req.user = toAuthUser(user);
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

export function authorize(...roles: UserRole[]) {
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
