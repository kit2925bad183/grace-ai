import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/enums';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_EXPIRES_IN = '7d';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch {
    throw new Error('Invalid or expired token');
  }
}
