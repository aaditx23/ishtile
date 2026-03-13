/**
 * POST /api/pathao/price-plan
 *
 * Pathao price calculation has been disabled. Shipping for customers now uses
 * a fixed manual fee configured in admin settings, and Pathao is only used
 * for parcel creation after admin confirmation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Keep auth checks so the route is not openly callable
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
  }
  try {
    const payload = await verifyToken(authHeader.substring(7));
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid token', data: null }, { status: 401 });
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Pathao price-plan endpoint is disabled. Shipping uses a fixed manual fee.',
      data:    null,
    },
    { status: 410 },
  );
}

