/**
 * OTP Route Handler
 *
 * POST /api/auth/otp
 *   body: { action: 'request', phone, purpose }
 *     → sends OTP (or returns debug code in dev)
 *
 *   body: { action: 'verify', phone, otpCode }
 *     → verifies OTP, issues JWT if a user account exists for the phone
 */
import { NextResponse } from 'next/server';
import { convex } from '@/infrastructure/convex/convexClient';
import { signToken } from '@/lib/auth';
import { api } from '../../../../../convex/_generated/api';

/**
 * Parse Convex error to extract clean message.
 * Convex errors: "[Request ID: xxx] Server Error\nUncaught Error: MESSAGE\n    at ..."
 */
function parseConvexError(err: unknown): string {
  if (!(err instanceof Error)) return 'An error occurred';
  const match = err.message.match(/Uncaught Error: ([^\n]+)/);
  return match ? match[1] : err.message;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json() as {
      action: 'request' | 'verify';
      phone?: string;
      purpose?: string;
      otpCode?: string;
    };

    const { action, phone } = body;

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (action === 'request') {
      const result = await convex.mutation(api.auth.otps.requestOtp, {
        phone: phone.trim(),
        purpose: body.purpose ?? 'login',
      });
      return NextResponse.json({ message: result.message, _debug: result._debug_otpCode });
    }

    if (action === 'verify') {
      if (!body.otpCode) {
        return NextResponse.json({ error: 'OTP code is required' }, { status: 400 });
      }
      const result = await convex.mutation(api.auth.otps.verifyOtp, {
        phone: phone.trim(),
        otpCode: body.otpCode,
      });
      const token = await signToken({
        userId: result.userId,
        role: result.role as 'buyer' | 'admin',
      });
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const message = parseConvexError(err);
    const status = message.includes('expired') || message.includes('invalid') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
