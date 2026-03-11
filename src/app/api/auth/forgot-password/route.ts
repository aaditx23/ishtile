/**
 * POST /api/auth/forgot-password
 * Generates a secure reset token, stores its SHA-256 hash in Convex,
 * and sends a reset link to the user's email.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { sendEmail } from '@/lib/email';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const email: string = (body?.email ?? '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Generate a 32-byte cryptographically random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing (never store the raw token)
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Token expires in 1 hour
    const expiry = Date.now() + 60 * 60 * 1000;

    // Store hash + expiry in Convex (throws if email not found)
    try {
      await convex.mutation(api.auth.users.storeResetToken, {
        email,
        tokenHash,
        expiry,
      });
    } catch {
      // Return a generic success to avoid leaking whether the email exists
      return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const resetLink = `${appUrl}/reset-password?token=${rawToken}`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="margin-bottom:8px;">Reset your password</h2>
        <p style="color:#555;margin-bottom:20px;">
          Click the button below to reset your Ishtile account password.
          This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#000;color:#fff;
                  text-decoration:none;border-radius:4px;font-weight:600;">
          Reset Password
        </a>
        <p style="margin-top:20px;font-size:12px;color:#888;">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="margin-top:24px;border:none;border-top:1px solid #eee;" />
        <p style="font-size:11px;color:#aaa;">
          Or copy this link: <a href="${resetLink}">${resetLink}</a>
        </p>
      </div>
    `;

    try {
      await sendEmail(email, 'Reset your Ishtile password', html);
      console.log('[forgot-password] reset email delivered to', email);
    } catch (emailErr) {
      console.error('[forgot-password] SMTP delivery failed:', emailErr);
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email. Please try again later.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.' },
      { status: 500 },
    );
  }
}
