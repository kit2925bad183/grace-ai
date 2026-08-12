import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/enums';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  tokenVersion?: number;
}

const ACCESS_EXPIRES_IN = '15m';
const REFRESH_EXPIRES_IN = '7d';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return {
      userId: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion ?? 0,
    };
  } catch {
    throw new Error('Invalid or expired token');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return {
      userId: decoded.userId,
      role: decoded.role,
      tokenVersion: decoded.tokenVersion ?? 0,
    };
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}

/** @deprecated Use signAccessToken */
export function signToken(payload: JwtPayload): string {
  return signAccessToken(payload);
}

/** @deprecated Use verifyAccessToken */
export function verifyToken(token: string): JwtPayload {
  return verifyAccessToken(token);
}
