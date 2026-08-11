import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
};

export function getCorsOrigins(): string | string[] {
  const raw = env.clientUrl.trim();
  if (!raw.includes(',')) return raw;
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

export function validateEnv(): void {
  const missing: string[] = [];

  if (!env.mongodbUri) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.CLIENT_URL) missing.push('CLIENT_URL');

  if (env.isProduction) {
    if (missing.length > 0) {
      console.error(
        `[config] Missing required environment variables: ${missing.join(', ')}`
      );
      console.error('[config] Set all required variables before starting in production.');
      process.exit(1);
    }

    if (env.jwtSecret === 'development-secret-change-me') {
      console.error('[config] JWT_SECRET must be a strong unique value in production.');
      process.exit(1);
    }
  } else {
    if (!env.mongodbUri) {
      console.warn(
        '[config] MONGODB_URI is not set. Database connection will fail until configured.'
      );
    }
    if (!process.env.JWT_SECRET) {
      console.warn('[config] JWT_SECRET not set — using development fallback.');
    }
  }
}

export function requireEnv(name: 'MONGODB_URI' | 'JWT_SECRET' | 'CLIENT_URL'): string {
  const values: Record<typeof name, string> = {
    MONGODB_URI: env.mongodbUri,
    JWT_SECRET: env.jwtSecret,
    CLIENT_URL: env.clientUrl,
  };
  const value = values[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
