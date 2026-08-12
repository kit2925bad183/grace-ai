import { connectDatabase, disconnectDatabase } from './config/database';
import { env, validateEnv } from './config/env';
import app from './app';

validateEnv();

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
