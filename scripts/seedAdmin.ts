/**
 * Seed Admin User
 * Creates an admin account in Convex
 * 
 * Usage: npx tsx scripts/seedAdmin.ts
 * Or: npm install -g tsx && tsx scripts/seedAdmin.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as bcrypt from 'bcryptjs';

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error('❌ NEXT_PUBLIC_CONVEX_URL not set in .env.local');
  process.exit(1);
}

const ADMIN_EMAIL = 'admin@yopmail.com';
const ADMIN_PHONE = '+8801700000000';
const ADMIN_PASSWORD = 'admin123';

async function seedAdmin() {
  const client = new ConvexHttpClient(CONVEX_URL!);

  console.log('🌱 Seeding admin user...\n');

  try {
    // Hash password (same as registration does)
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Create admin user
    const result = await client.mutation(api.auth.users.createAdmin, {
      phone: ADMIN_PHONE,
      email: ADMIN_EMAIL,
      passwordHash,
      fullName: 'Admin User',
    });

    console.log('✅ Admin user created successfully!');
    console.log('\nCredentials:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`\nUser ID: ${result.userId}`);
  } catch (err) {
    if (err instanceof Error && err.message.includes('already exists')) {
      console.log('ℹ️  Admin user already exists');
      console.log('\nCredentials:');
      console.log(`  Email: ${ADMIN_EMAIL}`);
      console.log(`  Password: ${ADMIN_PASSWORD}`);
    } else {
      console.error('❌ Failed to create admin:', err);
      process.exit(1);
    }
  }
}

seedAdmin();
