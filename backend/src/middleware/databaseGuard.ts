import { Request, Response, NextFunction } from 'express';
import { isDatabaseConnected } from '../config/database';

/** Block data/auth routes when MongoDB is unavailable — avoids opaque 500 errors. */
export function databaseAvailabilityGuard(req: Request, res: Response, next: NextFunction): void {
  const url = req.originalUrl.split('?')[0];
  if (url === '/api/health' || url === '/api/status') {
    next();
    return;
  }

  if (!isDatabaseConnected()) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable. The server is running but cannot connect to MongoDB yet.',
    });
    return;
  }

  next();
}
