import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';

const app = createApp();

describe('Admin authorization', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  it('rejects unauthenticated access to admin stats', async () => {
    const res = await request(app).get('/api/admin/stats');
    expect(res.status).toBe(401);
  });

  it('rejects citizen token on admin routes when no valid session', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer invalid-token');
    expect([401, 403]).toContain(res.status);
  });
});

describe('Health endpoints', () => {
  it('returns public health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

afterAll(async () => {
  await disconnectDatabase();
});
