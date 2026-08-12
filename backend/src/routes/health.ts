import { Router, Request, Response } from 'express';
import { getConnectionState, isDatabaseConnected } from '../config/database';
import { env } from '../config/env';

const router = Router();

function buildHealthBody() {
  const connected = isDatabaseConnected();
  const dbState = getConnectionState();

  return {
    success: connected,
    status: connected ? 'healthy' : 'degraded',
    service: 'GRACE AI API',
    database: connected ? 'connected' : dbState,
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  };
}

function sendHealth(res: Response): void {
  const body = buildHealthBody();

  if (!isDatabaseConnected()) {
    res.status(503).json({
      ...body,
      success: false,
      message: 'Database unavailable',
    });
    return;
  }

  res.status(200).json(body);
}

/** Liveness + database readiness */
router.get('/health', (_req: Request, res: Response) => {
  try {
    sendHealth(res);
  } catch {
    res.status(503).json({
      success: false,
      status: 'degraded',
      service: 'GRACE AI API',
      database: 'unknown',
      message: 'Health check failed',
    });
  }
});

/** Alias for monitoring tools */
router.get('/status', (_req: Request, res: Response) => {
  try {
    sendHealth(res);
  } catch {
    res.status(503).json({
      success: false,
      status: 'degraded',
      service: 'GRACE AI API',
      database: 'unknown',
      message: 'Status check failed',
    });
  }
});

export default router;
