import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createApp } from '../src/app';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { User } from '../src/models/User';
import { AuthProvider, UserRole } from '../src/models/enums';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '../src/utils/cookies';

const app = createApp();
const TEST_PASSWORD = 'Test@1234';
const TEST_EMAIL = 'test-auth@grace.test';

function extractCookie(cookies: string | string[] | undefined, name: string): string | undefined {
  const list = Array.isArray(cookies) ? cookies : cookies ? [cookies] : [];
  const match = list.find((c) => c.startsWith(`${name}=`));
  if (!match) return undefined;
  return match.split(';')[0].split('=')[1];
}

describe('Auth API', () => {
  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/grace-ai-test';
    }
    const ok = await connectDatabase();
    if (!ok) throw new Error('Test database connection failed');
  });

  afterAll(async () => {
    await User.deleteMany({ email: TEST_EMAIL });
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({ email: TEST_EMAIL });
  });

  it('registers a new user without auto-login session', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      phone: '9876543210',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    expect(res.body.data.user.emailVerified).toBe(false);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('rejects login for unverified email', async () => {
    await User.create({
      name: 'Test User',
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role: UserRole.CITIZEN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: false,
      isActive: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('logs in verified user and sets secure cookies', async () => {
    await User.create({
      name: 'Test User',
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role: UserRole.CITIZEN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      isActive: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
    expect(res.headers['set-cookie']).toBeDefined();

    const access = extractCookie(res.headers['set-cookie'], ACCESS_COOKIE);
    const refresh = extractCookie(res.headers['set-cookie'], REFRESH_COOKIE);
    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();
  });

  it('returns generic error for invalid login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'missing@grace.test',
      password: 'WrongPass1!',
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('protects /api/auth/me without session', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns current user with valid session cookie', async () => {
    await User.create({
      name: 'Test User',
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role: UserRole.CITIZEN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      isActive: true,
    });

    const login = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const access = extractCookie(login.headers['set-cookie'], ACCESS_COOKIE);
    const refresh = extractCookie(login.headers['set-cookie'], REFRESH_COOKIE);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${ACCESS_COOKIE}=${access}`, `${REFRESH_COOKIE}=${refresh}`]);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(TEST_EMAIL);
  });

  it('refreshes session with refresh cookie', async () => {
    await User.create({
      name: 'Test User',
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role: UserRole.CITIZEN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      isActive: true,
    });

    const login = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const refresh = extractCookie(login.headers['set-cookie'], REFRESH_COOKIE);

    const refreshed = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`${REFRESH_COOKIE}=${refresh}`]);

    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('returns generic forgot-password response', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({
      email: 'unknown@grace.test',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toMatch(/if an account exists/i);
  });

  it('enforces authority role on authority-check', async () => {
    await User.create({
      name: 'Citizen',
      email: TEST_EMAIL,
      passwordHash: await bcrypt.hash(TEST_PASSWORD, 10),
      role: UserRole.CITIZEN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      isActive: true,
    });

    const login = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const access = extractCookie(login.headers['set-cookie'], ACCESS_COOKIE);

    const res = await request(app)
      .get('/api/auth/authority-check')
      .set('Cookie', [`${ACCESS_COOKIE}=${access}`]);

    expect(res.status).toBe(403);
  });
});
