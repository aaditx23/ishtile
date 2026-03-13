/**
 * POST /api/admin/orders/[orderId]/confirm
 * Confirms an order with a chosen delivery mode (manual or pathao).
 *
 * Body:
 *   deliveryMode         'manual' | 'pathao'
 *   itemWeight?          number   (kg, required for pathao)
 *   itemQuantity?        number
 *   deliveryType?        'Normal Delivery' | 'Same Day Delivery' | 'Next Day Delivery'  (default: Normal)
 *   amountToCollect?     number   (defaults to order total for pathao)
 *   specialInstructions? string
 *   adminNotes?          string
 *   shippingCost?        number   (for manual — overrides calculated shipping)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';
import { getOrCreateStore } from '@/integrations/pathao/stores';
import { createParcel } from '@/integrations/pathao/orders';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises Bangladesh phone numbers to the 11-digit 01XXXXXXXXX format
 * accepted by Pathao (+8801... → 01..., 8801... → 01...).
 */
function normalizePhone(phone: string): string {
  const p = phone.trim().replace(/\s+/g, '');
  if (p.startsWith('+880')) return '0' + p.slice(4);
  if (p.startsWith('880') && p.length === 13) return '0' + p.slice(3);
  return p;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
): Promise<NextResponse> {
  // 1. Auth
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized', data: null, listData: null },
      { status: 401 },
    );
  }

  let payload;
  try {
    payload = await verifyToken(authHeader.substring(7));
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid token', data: null, listData: null },
      { status: 401 },
    );
  }

  if (!payload || payload.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Admin access required', data: null, listData: null },
      { status: 403 },
    );
  }

  const adminUserId = payload.userId as Id<'users'>;

  // 2. Parse params + body
  const { orderId: orderIdParam } = await params;
  const orderId = orderIdParam as Id<'orders'>;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body', data: null, listData: null },
      { status: 400 },
    );
  }

  const {
    deliveryMode,
    itemWeight,
    itemQuantity,
    deliveryType = 'Normal Delivery',
    amountToCollect,
    specialInstructions,
    adminNotes,
    shippingCost,
  } = body as {
    deliveryMode:          'manual' | 'pathao';
    itemWeight?:           number;
    itemQuantity?:         number;
    deliveryType?:         string;
    amountToCollect?:      number;
    specialInstructions?:  string;
    adminNotes?:           string;
    shippingCost?:         number;
  };

  if (deliveryMode !== 'manual' && deliveryMode !== 'pathao') {
    return NextResponse.json(
      { success: false, message: 'deliveryMode must be "manual" or "pathao"', data: null, listData: null },
      { status: 400 },
    );
  }

  // 3. Fetch order
  const order = await convex.query(api.orders.queries.getOrderById, {
    orderId,
    userId:  adminUserId,
    role:    'admin',
  });

  if (!order) {
    return NextResponse.json(
      { success: false, message: 'Order not found', data: null, listData: null },
      { status: 404 },
    );
  }

  // Pathao is a permanent assignment — block any change once pathao is set
  if (order.deliveryMode === 'pathao') {
    return NextResponse.json(
      { success: false, message: 'Cannot change delivery mode: order is already assigned to Pathao courier', data: null, listData: null },
      { status: 409 },
    );
  }

  // Allow first confirmation (status=new) or manual→pathao upgrade
  const isUpgrade = order.deliveryMode === 'manual' && deliveryMode === 'pathao';
  if (order.status !== 'new' && !isUpgrade) {
    return NextResponse.json(
      { success: false, message: `Order is already ${order.status} in this mode; no change needed`, data: null, listData: null },
      { status: 409 },
    );
  }

  // 4a. Manual delivery — just confirm the order
  if (deliveryMode === 'manual') {
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api as any).orders.mutations.setDeliveryMode,
      {
        orderId,
        deliveryMode: 'manual',
        shippingCost: typeof shippingCost === 'number' ? shippingCost : undefined,
        adminUserId,
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Order confirmed with manual delivery',
      data:     { orderId, deliveryMode: 'manual' },
      listData: null,
    });
  }

  // 4b. Pathao delivery
  const cityId  = order.shippingCityId;
  const zoneId  = order.shippingZoneId;
  const areaId  = order.shippingAreaId;

  if (!cityId || !zoneId || !areaId) {
    return NextResponse.json(
      {
        success: false,
        message: 'Order is missing shippingCityId / shippingZoneId / shippingAreaId — required for Pathao delivery',
        data: null, listData: null,
      },
      { status: 422 },
    );
  }

  if (!itemWeight || itemWeight <= 0) {
    return NextResponse.json(
      { success: false, message: 'itemWeight (kg) is required for Pathao delivery', data: null, listData: null },
      { status: 422 },
    );
  }

  // Validate and normalise phone
  const normalizedPhone = normalizePhone(order.shippingPhone ?? '');
  if (!/^01\d{9}$/.test(normalizedPhone)) {
    return NextResponse.json(
      { success: false, message: `Phone "${order.shippingPhone}" is not a valid 11-digit Bangladesh number (01XXXXXXXXX)`, data: null, listData: null },
      { status: 422 },
    );
  }

  // Validate address length
  if ((order.shippingAddress ?? '').length < 10) {
    return NextResponse.json(
      { success: false, message: 'Shipping address must be at least 10 characters for Pathao delivery', data: null, listData: null },
      { status: 422 },
    );
  }

  // Enforce Pathao minimum weight (0.5 kg)
  const safeItemWeight = Math.max(0.5, itemWeight);

  // Use the pre-calculated delivery fee when provided; fall back to the existing
  // order shippingCost so we never recompute the customer-facing fee here.
  const effectiveShippingCost =
    typeof shippingCost === 'number' ? shippingCost : order.shippingCost;

  try {
    const storeId = await getOrCreateStore();

    const parcel = await createParcel({
      store_id:             storeId,
      merchant_order_id:    order.orderNumber,
      recipient_name:       order.shippingName,
      recipient_phone:      normalizedPhone,
      recipient_address:    order.shippingAddress,
      recipient_city:       cityId,
      recipient_zone:       zoneId,
      recipient_area:       areaId,
      delivery_type:        deliveryType === 'Same Day Delivery' ? 12 : 48,
      item_type:            2, // parcel
      item_quantity:        typeof itemQuantity === 'number' ? itemQuantity : (order.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 1),
      item_weight:          safeItemWeight,
      amount_to_collect:    typeof amountToCollect === 'number' ? amountToCollect : order.total,
      item_description:     typeof specialInstructions === 'string' ? specialInstructions : undefined,
    });

    // Save shipment record
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api as any).shipments.mutations.createShipment,
      {
        orderId,
        consignmentId:       parcel.consignment_id,
        deliveryFee:         effectiveShippingCost ?? parcel.delivery_fee ?? 0,
        itemWeight,
        itemQuantity:        typeof itemQuantity === 'number' ? itemQuantity : undefined,
        deliveryType:        String(deliveryType),
        specialInstructions: typeof specialInstructions === 'string' ? specialInstructions : undefined,
        pathaoStatus:        parcel.order_status ?? null,
        deliveryProvider:    'pathao',
      },
    );

    // Confirm order with pathao mode
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api as any).orders.mutations.setDeliveryMode,
      {
        orderId,
        deliveryMode:  'pathao',
        shippingCost:  effectiveShippingCost,
        adminUserId,
      },
    );

    return NextResponse.json({
      success: true,
      message: 'Order confirmed with Pathao courier',
      data: {
        orderId,
        deliveryMode:    'pathao',
        consignmentId:   parcel.consignment_id,
        deliveryFee:     parcel.delivery_fee,
        pathaoStatus:    parcel.order_status,
      },
      listData: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pathao booking failed';
    return NextResponse.json(
      { success: false, message, data: null, listData: null },
      { status: 422 },
    );
  }
}
