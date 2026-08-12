import { Request, Response, NextFunction } from 'express';
import { isMaintenanceMode } from '../services/platformSettingsService';
import { verifyAccessToken } from '../utils/jwt';
import { ACCESS_COOKIE } from '../utils/cookies';
import { UserRole } from '../models/enums';

const BYPASS_PREFIXES = ['/api/health', '/api/auth/login', '/api/auth/refresh', '/api/auth/google'];

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[ACCESS_COOKIE];
  if (typeof cookieToken === 'string' && cookieToken.trim()) return cookieToken.trim();
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7).trim() || null;
  return null;
}

export async function maintenanceModeGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const path = req.path.startsWith('/api') ? req.path : `/api${req.path}`;
    if (BYPASS_PREFIXES.some((p) => path.startsWith(p))) {
      next();
      return;
    }

    const maintenance = await isMaintenanceMode();
    if (!maintenance) {
      next();
      return;
    }

    // Allow authenticated admins through during maintenance
    const token = extractToken(req);
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        if (payload.role === UserRole.ADMIN) {
          next();
          return;
        }
      } catch {
        // fall through to maintenance response
      }
    }

    if (path.startsWith('/api/admin')) {
      res.status(503).json({
        success: false,
        message: 'GRACE AI is temporarily under maintenance.',
        maintenance: true,
      });
      return;
    }

    res.status(503).json({
      success: false,
      message: 'GRACE AI is temporarily under maintenance.',
      maintenance: true,
    });
  } catch {
    next();
  }
}
