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
    const body = await req.json() as { phoneOrEmail?: string; password?: string };
    const { phoneOrEmail, password } = body;

    if (!phoneOrEmail?.trim()) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const result = await convex.mutation(api.auth.users.loginWithPassword, {
      phoneOrEmail: phoneOrEmail.trim(),
      password,
    });

    const token = await signToken({ userId: result.userId, role: result.role as 'buyer' | 'admin' });
    return NextResponse.json({ token });
  } catch (err: unknown) {
    const message = parseConvexError(err);
    const status = message.toLowerCase().includes('invalid') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
