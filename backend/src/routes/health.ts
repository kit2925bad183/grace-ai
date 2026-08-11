import { Router, Request, Response } from 'express';
import { getConnectionState, isDatabaseConnected } from '../config/database';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbState = getConnectionState();
  const connected = isDatabaseConnected();

  const payload = {
    status: connected ? 'ok' : 'degraded',
    service: 'GRACE AI API',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    database: connected ? 'connected' : dbState,
  };

  if (!connected) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      data: payload,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: payload,
  });
});

export default router;
