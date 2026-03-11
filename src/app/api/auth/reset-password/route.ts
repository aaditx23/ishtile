/**
 * POST /api/auth/reset-password
 * Validates the reset token and updates the user's password.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const token: string       = (body?.token       ?? '').trim();
    const newPassword: string = (body?.newPassword ?? '').trim();

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 },
      );
    }

    // Hash the token to look up in DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Pre-hash the new password in Next.js (mirrors the register route pattern)
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Verify token + update password (throws if invalid/expired)
    await convex.mutation(api.auth.users.resetPassword, {
      tokenHash,
      newPasswordHash,
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    return NextResponse.json(
      { success: false, message },
      { status: 400 },
    );
  }
}
