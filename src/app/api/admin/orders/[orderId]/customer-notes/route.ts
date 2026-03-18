/**
 * PATCH /api/admin/orders/[orderId]/customer-notes
 * Update the customer notes field on an order (admin only).
 * Body: { customerNotes: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyToken(authHeader.substring(7));
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
    }

    const { orderId: orderIdParam } = await params;
    const body = await req.json();
    const customerNotes: string = body.customerNotes ?? '';

    await convex.mutation(api.orders.mutations.updateCustomerNotes, {
      orderId:       orderIdParam as Id<'orders'>,
      customerNotes,
      adminUserId:   payload.userId as Id<'users'>,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Customer Notes API] Error:', err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Failed to update notes' },
      { status: 500 },
    );
  }
}
