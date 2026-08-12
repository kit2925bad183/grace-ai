import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import { getCorsOrigins } from './config/env';
import { configureGoogleAuth } from './services/googleAuthService';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import grievanceRoutes from './routes/grievances';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import notificationRoutes from './routes/notifications';
import categoryRoutes from './routes/categories';
import wardRoutes from './routes/wards';
import officerRoutes from './routes/officers';
import duplicateRoutes from './routes/duplicates';
import departmentRoutes from './routes/department';
import headRoutes from './routes/head';
import adminRoutes from './routes/admin';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { maintenanceModeGuard } from './middleware/maintenanceMode';

export function createApp() {
  const app = express();

  app.use(requestIdMiddleware);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use(passport.initialize());

  configureGoogleAuth();

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests, please try again later',
      },
    })
  );

  app.use(maintenanceModeGuard);

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/grievances', grievanceRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/wards', wardRoutes);
  app.use('/api/officers', officerRoutes);
  app.use('/api/duplicates', duplicateRoutes);
  app.use('/api/department', departmentRoutes);
  app.use('/api/head', headRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp();
