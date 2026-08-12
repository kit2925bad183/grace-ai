import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export interface MongoConfig {
  uri: string;
  user?: string;
  pass?: string;
  dbName?: string;
}

export function getMongoConfig(): MongoConfig {
  const uri = process.env.MONGODB_URI?.trim();
  if (uri) {
    return { uri };
  }

  const user = process.env.MONGODB_USER?.trim();
  const pass = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST?.trim();
  const dbName = process.env.MONGODB_DB?.trim() || 'grace-ai';

  if (user && pass && host) {
    return {
      uri: `mongodb+srv://${host}/${dbName}?retryWrites=true&w=majority`,
      user,
      pass,
      dbName,
    };
  }

  return { uri: '' };
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT, 5000),
  mongodbUri: getMongoConfig().uri,
  jwtSecret: process.env.JWT_SECRET ?? 'development-secret-change-me',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET ?? 'development-refresh-secret',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:5000/api/auth/google/callback',
  emailProvider: process.env.EMAIL_PROVIDER ?? 'console',
  emailFrom: process.env.EMAIL_FROM ?? 'noreply@grace-ai.local',
  emailApiKey: process.env.EMAIL_API_KEY ?? '',
  isProduction: process.env.NODE_ENV === 'production',
};

export function getCorsOrigins(): string[] {
  const origins = new Set<string>();
  const raw = env.clientUrl.trim();

  if (raw.includes(',')) {
    raw.split(',').forEach((origin) => {
      const trimmed = origin.trim();
      if (trimmed) origins.add(trimmed);
    });
  } else if (raw) {
    origins.add(raw);
  }

  origins.add('http://localhost:5173');
  origins.add('http://127.0.0.1:5173');

  return Array.from(origins);
}

/** Primary frontend URL for OAuth redirects (prefers non-localhost). */
export function getPrimaryClientUrl(): string {
  const origins = getCorsOrigins();
  const production = origins.find(
    (origin) => !origin.includes('localhost') && !origin.includes('127.0.0.1')
  );
  return production ?? origins[0] ?? 'http://localhost:5173';
}

export function isGoogleOAuthConfigured(): boolean {
  // Requires client ID, secret, and callback URL in .env
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleCallbackUrl);
}

export function validateEnv(): void {
  const missing: string[] = [];

  const hasMongo =
    Boolean(process.env.MONGODB_URI?.trim()) ||
    Boolean(process.env.MONGODB_USER && process.env.MONGODB_PASSWORD);

  if (!hasMongo) missing.push('MONGODB_URI or MONGODB_USER+MONGODB_PASSWORD');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET && env.isProduction) missing.push('JWT_REFRESH_SECRET');
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

    if (env.jwtRefreshSecret === env.jwtSecret) {
      console.warn('[config] JWT_REFRESH_SECRET should differ from JWT_SECRET in production.');
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
    if (!process.env.JWT_REFRESH_SECRET) {
      console.warn('[config] JWT_REFRESH_SECRET not set — using development fallback.');
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
