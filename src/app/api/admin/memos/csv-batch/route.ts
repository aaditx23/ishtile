/**
 * POST /api/admin/memos/csv-batch
 * Generate CSV export for selected orders in Pathao format.
 * Body: { orderIds: string[] }   ← Convex Id<'orders'>[]
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';
import { ordersToCsvString } from '@/lib/csv-utils';
import { LocationNameResolver } from '@/lib/pathao/locationResolver';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1️⃣ Auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 },
      );
    }

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 },
      );
    }

    const adminUserId = payload.userId as Id<'users'>;

    // 2️⃣ Trigger lazy sync (best effort, non-blocking)
    try {
      console.log('[Batch CSV API] Triggering location sync...');
      await convex.action(api.locations_syncAction.default, { forceSync: false });
    } catch (syncErr) {
      console.error('[Batch CSV API] Sync failed (non-critical):', syncErr);
      // Continue with CSV generation even if sync fails
    }

    // 3️⃣ Parse body
    let body: { orderIds?: string[] };
    try {
      const rawText = await req.text();
      body = rawText ? JSON.parse(rawText) : {};
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty request body' },
        { status: 400 },
      );
    }
    const orderIds: Id<'orders'>[] = (body.orderIds ?? []) as Id<'orders'>[];

    if (!orderIds.length) {
      return NextResponse.json(
        { success: false, message: 'No order IDs provided' },
        { status: 400 },
      );
    }

    // 4️⃣ Fetch all orders in parallel
    const rawOrders = await Promise.all(
      orderIds.map((orderId) =>
        convex.query(api.orders.queries.getOrderById, {
          orderId,
          userId: adminUserId,
          role: 'admin',
        }),
      ),
    );

    // Filter out any nulls (order not found / access denied)
    const orders = rawOrders.filter(Boolean) as NonNullable<(typeof rawOrders)[number]>[];

    if (!orders.length) {
      return NextResponse.json(
        { success: false, message: 'No valid orders found' },
        { status: 404 },
      );
    }

    // 5️⃣ Initialize location resolver and load cache
    const resolver = new LocationNameResolver();
    try {
      await resolver.loadFromConvex(convex);
      console.log('[Batch CSV API] Location resolver loaded:', resolver.getStats());
    } catch (resolverErr) {
      console.error('[Batch CSV API] Failed to load resolver (will use fallback):', resolverErr);
      // Continue - resolver will fallback to city names
    }

    // 6️⃣ Fetch active Pathao store
    let activeStoreName: string | undefined;
    try {
      const activeStore = await convex.query(api.shipments.queries.getActivePathaoStore);
      activeStoreName = activeStore?.storeName;
      if (!activeStoreName) {
        console.warn('[Batch CSV API] No active Pathao store found, using fallback store name');
      }
    } catch (storeErr) {
      console.error('[Batch CSV API] Failed to fetch active store:', storeErr);
    }

    // 7️⃣ Map to compatible format for CSV
    const orderEntities = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      deliveryMode: order.deliveryMode,
      pathaoConsignmentId: order.pathaoConsignmentId ?? null,
      pathaoStatus: order.pathaoStatus ?? null,
      pathaoPrice: order.pathaoPrice ?? null,
      pathaoRawPayload: order.pathaoRawPayload,
      subtotal: order.subtotal,
      promoDiscount: order.promoDiscount,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingAddressLine: order.shippingAddressLine ?? null,
      shippingCity: order.shippingCity,
      shippingCityId: order.shippingCityId ?? null,
      shippingZoneId: order.shippingZoneId ?? null,
      shippingAreaId: order.shippingAreaId ?? null,
      shippingPostalCode: order.shippingPostalCode ?? null,
      customerNotes: order.customerNotes ?? null,
      adminNotes: order.adminNotes ?? null,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
      createdAt: new Date(order._creationTime).toISOString(),
      items: order.items ?? [],
    }));

    // 8️⃣ Convert to CSV
    const csvContent = ordersToCsvString(orderEntities, resolver, activeStoreName);

    // 9️⃣ Generate filename with current date
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `orders-batch-${date}.csv`;

    // 🔟 Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(csvContent, 'utf-8').toString(),
      },
    });
  } catch (err) {
    console.error('[Batch CSV API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to generate CSV',
      },
      { status: 500 },
    );
  }
}
