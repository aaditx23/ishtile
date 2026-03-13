import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { convex } from '@/infrastructure/convex/convexClient';
import { verifyToken } from '@/lib/auth';
import { api } from '../../../../../convex/_generated/api';
import { toCamelCase } from '@/infrastructure/api/caseConverters';

function parseConvexError(err: unknown): string {
  if (!(err instanceof Error)) return 'An error occurred';
  const match = err.message.match(/Uncaught Error: ([^\n]+)/);
  return match ? match[1] : err.message;
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-]/g, '');
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null, listData: null }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required', data: null, listData: null }, { status: 403 });
    }

    const body = toCamelCase(await req.json()) as {
      phone?: string;
      email?: string;
      username?: string;
      fullName?: string;
      password?: string;
    };

    const phone = body.phone ? normalizePhone(body.phone) : '';
    const email = body.email?.trim() ?? '';
    const username = body.username?.trim() ?? '';
    const fullName = body.fullName?.trim() ?? '';
    const password = body.password ?? '';

    if (!email || !username || !fullName || !password) {
      return NextResponse.json({ success: false, message: 'Email, username, full name, and password are required', data: null, listData: null }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await convex.mutation(api.auth.users.createAdmin, {
      phone: phone || undefined,
      email,
      username,
      fullName,
      passwordHash,
    });

    return NextResponse.json({ success: true, message: 'Admin created', data: null, listData: null }, { status: 201 });
  } catch (err: unknown) {
    const message = parseConvexError(err);
    const status = message.toLowerCase().includes('already exists') ? 409 : 500;
    return NextResponse.json({ success: false, message, data: null, listData: null }, { status });
  }
}
