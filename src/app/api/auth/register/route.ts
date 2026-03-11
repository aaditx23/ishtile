import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
      phone?: string;
      email?: string;
      username?: string;
      fullName?: string;
      password?: string;
    };

    const { phone, email, username, fullName, password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    if (!phone && !email && !username) {
      return NextResponse.json(
        { error: 'At least one of phone, email, or username is required' },
        { status: 400 },
      );
    }

    // Hash password server-side — bcrypt.hash uses randomness so it must run
    // in Node.js (Convex V8 isolate cannot hash, only compare).
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await convex.mutation(api.auth.users.register, {
      phone,
      email,
      username,
      fullName,
      passwordHash,
    });

    const token = await signToken({ userId: result.userId, role: 'buyer' });
    return NextResponse.json({ token }, { status: 201 });
  } catch (err: unknown) {
    const message = parseConvexError(err);
    const status = message.toLowerCase().includes('already exists') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
