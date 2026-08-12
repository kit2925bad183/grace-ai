import mongoose from 'mongoose';
import { env, getMongoConfig } from './env';

let isConnected = false;
let reconnectTimer: ReturnType<typeof setInterval> | null = null;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected && isDatabaseConnected()) {
    return true;
  }

  const mongo = getMongoConfig();

  if (!mongo.uri) {
    console.error('[database] MongoDB connection failed: MONGODB_URI is not configured.');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => undefined);
      isConnected = false;
    }

    await mongoose.connect(mongo.uri, {
      ...(mongo.user && mongo.pass
        ? { user: mongo.user, pass: mongo.pass, dbName: mongo.dbName }
        : {}),
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('[database] MongoDB connected');
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[database] MongoDB connection failed.');
    console.error('[database]', message);
    isConnected = false;
    return false;
  }
}

export function startDatabaseReconnectLoop(intervalMs = 30000): void {
  if (reconnectTimer) return;

  reconnectTimer = setInterval(async () => {
    if (isDatabaseConnected()) return;
    console.log('[database] Retrying MongoDB connection…');
    await connectDatabase();
  }, intervalMs);

  reconnectTimer.unref?.();
}

export function stopDatabaseReconnectLoop(): void {
  if (reconnectTimer) {
    clearInterval(reconnectTimer);
    reconnectTimer = null;
  }
}

export async function disconnectDatabase(): Promise<void> {
  stopDatabaseReconnectLoop();

  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('[database] MongoDB disconnected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[database] Disconnect failed:', message);
    throw error;
  }
}

export function getConnectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] ?? 'unknown';
}

export function isDatabaseConnected(): boolean {
  return getConnectionState() === 'connected';
}

export { mongoose };
