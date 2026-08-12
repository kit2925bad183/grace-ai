#!/usr/bin/env tsx
/**
 * Bootstrap the first platform Admin account.
 * Usage: npm run create-admin
 * Env: INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD
 */
import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import { bootstrapAdmin } from '../src/services/adminService';

async function main() {
  const name = process.env.INITIAL_ADMIN_NAME?.trim();
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error('Missing required environment variables:');
    console.error('  INITIAL_ADMIN_NAME');
    console.error('  INITIAL_ADMIN_EMAIL');
    console.error('  INITIAL_ADMIN_PASSWORD');
    process.exit(1);
  }

  await connectDatabase();

  try {
    await bootstrapAdmin({ name, email, password });
    console.log('✓ Platform Admin account created successfully.');
    console.log(`  Email: ${email}`);
    console.log('  Password was NOT stored in logs. Use the value from your environment.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bootstrap failed';
    console.error('✗', message);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

main();
