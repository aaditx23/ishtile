import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../../convex/_generated/api';
import { verifyToken } from '@/lib/auth';
import { createPathaoOrder } from '@/lib/pathao';
import { resolvePathaoStoreId } from '@/app/api/pathao/_utils/resolveStore';
import { getBaseUrl } from '@/shared/config/baseUrl';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
): Promise<NextResponse> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null, listData: null }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null, listData: null }, { status: 401 });
    }

    const { orderId: orderIdParam } = await params;
    const orderId = orderIdParam as Id<'orders'>;
    const actorUserId = payload.userId as Id<'users'>;

    // 1) fetch order from database
    const order = await convex.query(api.orders.queries.getOrderById, {
      orderId,
      userId: actorUserId,
      role: payload.role,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found', data: null, listData: null }, { status: 404 });
    }

    if ((order.deliveryMode ?? 'manual') !== 'pathao') {
      return NextResponse.json(
        {
          success: false,
          message: 'Order delivery mode is manual. Set pathao before creating parcel.',
          data: null,
          listData: null,
        },
        { status: 400 },
      );
    }

    if (order.pathaoConsignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parcel already exists for this order',
          data: null,
          listData: null,
        },
        { status: 409 },
      );
    }

    if (!order.shippingCityId || !order.shippingZoneId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing shipping city/zone for Pathao order creation',
          data: null,
          listData: null,
        },
        { status: 400 },
      );
    }

    const recipientName = order.shippingName;
    const recipientPhone = order.shippingPhone;
    const recipientAddress = order.shippingAddressLine || order.shippingAddress;
    const recipientCity = Number(order.shippingCityId);
    const recipientZone = Number(order.shippingZoneId);
    const recipientArea = order.shippingAreaId ? Number(order.shippingAreaId) : null;

    // 2) resolve store
    const storeId = await resolvePathaoStoreId();

    const baseUrl = getBaseUrl();

    // 3) create Pathao order (this also creates parcel in Pathao lifecycle)
    const created = await createPathaoOrder({
      store_id: storeId,
      merchant_order_id: order.orderNumber,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_address: recipientAddress,
      recipient_city: recipientCity,
      recipient_zone: recipientZone,
      ...(recipientArea ? { recipient_area: recipientArea } : {}),
      delivery_type: 48,
      item_type: 2,
      item_weight: 500,
      item_quantity: order.items?.length || 1,
      amount_to_collect: order.total,
      callback_url: `${baseUrl}/api/webhooks/pathao`,
    });

    const orderData = created.data?.order;
    const consignmentId = orderData?.consignment_id;
    const pathaoStatus = orderData?.order_status ?? 'ORDER_CREATED';
    const deliveryFee = Number(orderData?.delivery_fee ?? 0);

    if (!consignmentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pathao response missing consignment_id',
          data: created,
          listData: null,
        },
        { status: 502 },
      );
    }

    // 4) save consignmentId to order
    await convex.mutation((api as any).orders.mutations.createPathaoParcel, {
      orderId,
      consignmentId,
      pathaoStatus,
      pathaoPrice: deliveryFee,
      rawPayload: created,
      adminUserId: actorUserId,
    });

    // 5) return result
    return NextResponse.json({
      success: true,
      message: 'Pathao order created from checkout',
      data: {
        consignmentId,
        deliveryPrice: deliveryFee,
        status: pathaoStatus,
      },
      listData: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create Pathao order from checkout',
        data: null,
        listData: null,
      },
      { status: 500 },
    );
  }
}
