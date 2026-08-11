import mongoose from 'mongoose';
import { env } from './env';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  if (!env.mongodbUri) {
    throw new Error('Unable to connect to MongoDB. MONGODB_URI is not configured.');
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongodbUri);

    isConnected = true;
    console.log('[database] MongoDB connected');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error('[database] Unable to connect to MongoDB.');
    console.error('[database]', message);
    throw new Error('Unable to connect to MongoDB.');
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
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
