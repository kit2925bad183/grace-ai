import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';

const app = createApp();

describe('Health & status endpoints', () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/grace-ai-test';
    }
    const ok = await connectDatabase();
    if (!ok) throw new Error('Test database connection failed');
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  it('GET /api/health returns healthy JSON when database is connected', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('GRACE AI API');
    expect(res.body.database).toBe('connected');
    expect(JSON.stringify(res.body)).not.toMatch(/mongodb(\+srv)?:\/\//i);
  });

  it('GET /api/status mirrors health', async () => {
    const res = await request(app).get('/api/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database).toBe('connected');
  });
});
