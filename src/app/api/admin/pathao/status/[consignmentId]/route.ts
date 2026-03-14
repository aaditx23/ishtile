import { NextRequest, NextResponse } from 'next/server';
import { pathaoClient } from '@/lib/pathao/client';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type OrderStatusForPathao = 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const PATHAO_STATUS_MAP: Record<string, OrderStatusForPathao> = {
  order_created: 'confirmed',
  created: 'confirmed',
  confirmed: 'confirmed',
  pending: 'confirmed',
  order_assigned: 'confirmed',
  assigned: 'confirmed',
  order_picked: 'shipped',
  picked: 'shipped',
  pickup: 'shipped',
  in_transit: 'shipped',
  transit: 'shipped',
  order_delivered: 'delivered',
  delivered: 'delivered',
  order_returned: 'cancelled',
  returned: 'cancelled',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

function normalizePathaoStatus(raw: string): string {
  return raw.trim().toLowerCase().replace(/\./g, '_').replace(/\s+/g, '_');
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ consignmentId: string }> }
) {
  try {
    const { consignmentId } = await context.params;
    if (!consignmentId) {
      return NextResponse.json({ error: 'Missing consignmentId' }, { status: 400 });
    }

    // STEP 2: Find order safely
    const order = await convex.query((api as any).orders.queries.getOrderByConsignmentId, { consignmentId });
    if (!order) {
      console.error('Order not found for consignment:', consignmentId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    console.log('Order found:', order._id);

    // STEP 5: Continue refresh logic
    const info = await pathaoClient.orders.getInfo(consignmentId);
    // Fall back to the stored status if Pathao doesn't return one,
    // so the response never contains undefined.
    const courierStatusRaw: string = info?.data?.order_status ?? order.pathaoStatus ?? 'pending';
    const courierStatus = normalizePathaoStatus(courierStatusRaw);
    console.log('Pathao courier status:', courierStatusRaw, '->', courierStatus);

    // STEP 6: Map courier status
    const mapped = PATHAO_STATUS_MAP[courierStatus];

    // STEP 7: Update order (only if we have a real status from Pathao)
    if (info?.data?.order_status) {
      await convex.mutation((api as any).orders.mutations.updatePathaoStatus, {
        consignmentId,
        pathaoStatus: courierStatus,
        ...(mapped ? { status: mapped } : {}),
      });
    }

    // STEP 8: Return response
    return NextResponse.json({
      success: true,
      pathaoStatus: courierStatus,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      pathaoStatus: null,
      message: error instanceof Error ? error.message : 'Failed to refresh Pathao status',
    }, { status: 500 });
  }
}
