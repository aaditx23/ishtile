/**
 * GET /api/pathao/order-status?consignmentId=XXXX
 * Admin-only: Pulls current delivery status from Pathao and syncs to Convex.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { verifyToken } from '@/lib/auth';
import { getParcelStatus } from '@/integrations/pathao/orders';
import { mapPathaoStatus } from '@/integrations/pathao/webhook';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest): Promise<NextResponse> {
  // 1. Auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized', data: null, listData: null },
      { status: 401 },
    );
  }

  let tokenPayload;
  try {
    tokenPayload = await verifyToken(authHeader.substring(7));
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid token', data: null, listData: null },
      { status: 401 },
    );
  }

  if (!tokenPayload || tokenPayload.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Admin access required', data: null, listData: null },
      { status: 403 },
    );
  }

  // 2. Parse query param
  const consignmentId = req.nextUrl.searchParams.get('consignmentId');
  if (!consignmentId) {
    return NextResponse.json(
      { success: false, message: 'consignmentId query param required', data: null, listData: null },
      { status: 400 },
    );
  }

  // 3. Fetch from Pathao
  let statusData;
  try {
    statusData = await getParcelStatus(consignmentId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pathao API error';
    return NextResponse.json(
      { success: false, message, data: null, listData: null },
      { status: 502 },
    );
  }

  // 4. Map and sync to Convex
  const internalStatus = mapPathaoStatus(statusData.order_status ?? '');

  if (internalStatus) {
    try {
      await convex.mutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { name: 'shipments:updateShipment' } as any,
        {
          consignmentId,
          status:          internalStatus,
          pathaoStatus:    statusData.order_status ?? null,
          trackingData:    JSON.stringify(statusData),
          statusUpdateTime: Date.now(),
        },
      );
    } catch {
      // Non-fatal — return status data anyway
    }
  }

  return NextResponse.json({
    success:  true,
    message:  'Status synced',
    data: {
      consignmentId,
      pathaoStatus:    statusData.order_status,
      internalStatus,
    },
    listData: null,
  });
}
