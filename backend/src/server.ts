import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env, validateEnv, getCorsOrigins } from './config/env';
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
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

validateEnv();

const app = express();

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

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    const host = '0.0.0.0';
    app.listen(env.port, host, () => {
      console.log(`[server] GRACE AI API listening on port ${env.port} (${env.nodeEnv})`);
      console.log('[server] Health check: /api/health');
    });
  } catch (error) {
    console.error(
      '[server] Failed to start:',
      error instanceof Error ? error.message : error
    );
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n[server] Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[server] Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();

export default app;
