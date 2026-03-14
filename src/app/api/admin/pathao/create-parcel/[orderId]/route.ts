import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../../convex/_generated/api';
import { verifyToken } from '@/lib/auth';
import { createPathaoOrder } from '@/lib/pathao/service';
import { resolvePathaoStoreId } from '@/app/api/pathao/_utils/resolveStore';
import { getBaseUrl } from '@/shared/config/baseUrl';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface CreateParcelBody {
  name?: string;
  phone?: string;
  address?: string;
  city?: number | string;
  zone?: number | string;
  area?: number | string;
  item_quantity?: number | string;
  item_weight?: number | string;
  amount_to_collect?: number | string;
  special_instruction?: string;
  delivery_type?: number | string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
): Promise<Response> {
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

    const { orderId: orderIdParam } = await params;
    const orderId = orderIdParam as Id<'orders'>;
    const adminUserId = payload.userId as Id<'users'>;

    let body: Record<string, unknown> = {};

    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const order = await convex.query(api.orders.queries.getOrderById, {
      orderId,
      userId: adminUserId,
      role: 'admin',
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found', data: null, listData: null }, { status: 404 });
    }


    if (order.pathaoConsignmentId || order.pathaoParcelCreated) {
      console.log('Duplicate parcel creation attempt for order:', order._id);
      return Response.json(
        { error: 'Parcel already exists for this order' },
        { status: 409 },
      );
    }

    // Allow parcel creation for pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new Error("Order must be pending or confirmed before creating parcel");
    }

    if ((order.deliveryMode ?? 'manual') !== 'pathao') {
      return NextResponse.json(
        {
          success: false,
          message: 'Set delivery mode to pathao before creating a Pathao parcel',
          data: null,
          listData: null,
        },
        { status: 400 },
      );
    }

    const recipientName = String(
      body.recipient_name ?? body.name ?? body.recipientName ?? order.shippingName ?? ''
    ).trim();
    const recipientPhone = String(
      body.recipient_phone ?? body.phone ?? body.recipientPhone ?? order.shippingPhone ?? ''
    ).trim();
    const recipientAddress = String(
      body.recipient_address ?? body.address ?? body.recipientAddress ?? order.shippingAddressLine ?? order.shippingAddress ?? ''
    ).trim();
    const recipientCity = Number(body.recipient_city ?? body.city ?? body.recipientCity ?? order.shippingCityId);
    const recipientZone = Number(body.recipient_zone ?? body.zone ?? body.recipientZone ?? order.shippingZoneId);
    const recipientArea = Number(body.recipient_area ?? body.area ?? body.recipientArea ?? order.shippingAreaId);
    const itemQuantity = Number(body.item_quantity ?? body.itemQuantity ?? 1);
    const itemWeight = Number(body.item_weight ?? body.itemWeight ?? 1);
    const amountToCollect = Number(body.amount_to_collect ?? body.amountToCollect ?? order.total);
    const specialInstruction = String(body.special_instruction ?? body.specialInstruction ?? '');
    const deliveryType = Number(body.delivery_type ?? body.deliveryType ?? 48);

    if (![48, 12].includes(deliveryType)) {
      throw new Error('Invalid delivery type');
    }

    const storeId = await resolvePathaoStoreId({
      fallbackName: 'Ishtile Store',
      fallbackPhone: recipientPhone,
      fallbackAddress: recipientAddress,
      fallbackCityId: recipientCity,
      fallbackZoneId: recipientZone,
      fallbackAreaId: recipientArea,
    });
    const baseUrl = getBaseUrl();

    const payloadForPathao = {
      store_id: storeId,
      merchant_order_id: order.orderNumber,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_address: recipientAddress,
      recipient_city: recipientCity,
      recipient_zone: recipientZone,
      recipient_area: recipientArea,
      item_quantity: itemQuantity,
      item_weight: itemWeight,
      amount_to_collect: amountToCollect,
      special_instruction: specialInstruction,
      delivery_type: deliveryType,
      item_type: 2,
      callback_url: `${baseUrl}/api/webhooks/pathao`,
    };

    const required = [
      'recipient_name',
      'recipient_phone',
      'recipient_address',
      'recipient_city',
      'recipient_zone',
      'recipient_area',
      'item_quantity',
      'item_weight',
      'amount_to_collect',
    ];

    // Type-safe required field check
    required.forEach((field) => {
      const value = (payloadForPathao as Record<string, unknown>)[field];
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    console.log('PATHAO PAYLOAD:', JSON.stringify(payloadForPathao, null, 2));

    const created = await createPathaoOrder(payloadForPathao);

    console.log('Pathao API raw response:', JSON.stringify(created, null, 2));

    const orderData = created.data?.order;
    const consignmentId = created?.data?.consignment_id;
    const pathaoStatus = created?.data?.order_status ?? orderData?.order_status ?? 'order_created';
    const deliveryFee = Number(created?.data?.delivery_fee ?? orderData?.delivery_fee ?? 0);

    if (!consignmentId) {
      throw new Error('Pathao response missing consignment_id');
    }

    await convex.mutation((api as any).orders.mutations.createPathaoParcel, {
      orderId,
      consignmentId,
      pathaoStatus,
      pathaoPrice: deliveryFee,
      rawPayload: created,
      adminUserId,
    });

    // Auto-promote pending orders to confirmed once parcel is created.
    // source: "system" bypasses the Pathao webhook guard in updateOrderStatus.
    if (order.status === "pending") {
      await convex.mutation((api as any).orders.mutations.updateOrderStatus, {
        orderId,
        status: "confirmed",
        adminUserId,
        source: "system",
      });
    }

    const trackingUrl = `https://track.pathao.com/?consignment_id=${encodeURIComponent(String(consignmentId))}`;

    return NextResponse.json({
      success: true,
      message: 'Pathao parcel created',
      data: {
        success: true,
        consignmentId,
        pathaoStatus,
        deliveryFee,
        trackingUrl,
      },
      listData: null,
    });
  } catch (error) {
    console.error('Pathao create parcel error:', error);
    const message = error instanceof Error ? error.message : 'Parcel creation failed';
    if (message.toLowerCase().startsWith('missing required field:')) {
      return Response.json({ error: message }, { status: 400 });
    }
    if (message.toLowerCase().includes('parcel already exists')) {
      return Response.json({ error: 'Parcel already exists for this order' }, { status: 409 });
    }

    const apiError = error as {
      statusCode?: number;
      response?: unknown;
    };

    if (typeof apiError.statusCode === 'number' && apiError.statusCode >= 400 && apiError.statusCode < 500) {
      return Response.json(
        {
          error: message,
          details: apiError.response ?? null,
        },
        { status: apiError.statusCode },
      );
    }

    return Response.json(
      { error: message },
      { status: 500 },
    );
  }
}
