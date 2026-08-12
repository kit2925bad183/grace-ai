import { connectDatabase, disconnectDatabase, startDatabaseReconnectLoop } from './config/database';
import { env, validateEnv } from './config/env';
import app from './app';

validateEnv();

async function startServer(): Promise<void> {
  const host = '0.0.0.0';

  app.listen(env.port, host, () => {
    console.log(`[server] Server started on port ${env.port}`);
    console.log(`[server] Environment: ${env.nodeEnv}`);
    console.log('[server] Health check: GET /api/health');
    console.log('[server] Status check: GET /api/status');
  });

  const connected = await connectDatabase();
  if (!connected) {
    console.warn('[server] Starting in degraded mode — database unavailable');
    startDatabaseReconnectLoop();
  }
}

process.on('SIGINT', async () => {
  console.log('\n[server] Shutting down gracefully…');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[server] Shutting down gracefully…');
  await disconnectDatabase();
  process.exit(0);
});

startServer().catch((error) => {
  console.error(
    '[server] Fatal startup error:',
    error instanceof Error ? error.message : error
  );
  process.exit(1);
});

export default app;
