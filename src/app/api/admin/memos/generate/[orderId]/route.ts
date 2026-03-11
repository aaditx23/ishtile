/**
 * POST /api/admin/memos/generate/[orderId]
 * Generate and download PDF invoice for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';
import { generateMemoPDF } from '@/lib/pdf/invoicePdf';
import type { MemoData } from '@/lib/pdf/memoHtml';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
): Promise<NextResponse> {
  try {
    // 1️⃣ Auth check
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null, listData: null },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token', data: null, listData: null },
        { status: 401 }
      );
    }

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required', data: null, listData: null },
        { status: 403 }
      );
    }

    const adminUserId = payload.userId as Id<'users'>;

    // 2️⃣ Parse orderId
    const { orderId: orderIdParam } = await params;
    const orderId = orderIdParam as Id<'orders'>;

    // 3️⃣ Fetch order from Convex
    const order = await convex.query(api.orders.queries.getOrderById, { 
      orderId, 
      userId: adminUserId, 
      role: 'admin' 
    });

    if (!order || !order.items) {
      return NextResponse.json(
        { success: false, message: 'Order not found', data: null, listData: null },
        { status: 404 }
      );
    }

    // 4️⃣ Map order data to MemoData
    const memoData: MemoData = {
      invoiceId: order.orderNumber,
      date: new Date(order._creationTime).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      paymentStatus: order.isPaid ? 'PAID' : 'UNPAID',
      customerName: order.shippingName,
      phoneNumber: order.shippingPhone,
      shippingAddress: [order.shippingAddress, order.shippingCity]
        .filter(Boolean)
        .join(', '),
      items: order.items.map(item => ({
        productName: item.productName,
        sku: item.variantSku ?? '',
        clr: item.variantColor ?? '',
        sz: item.variantSize ?? '',
        qty: item.quantity,
        total: item.lineTotal,
      })),
      delivery: order.shippingCost,
      advDisc: order.promoDiscount,
      total: order.total,
    };

    // 5️⃣ Generate memo PDF
    const pdfBuffer = await generateMemoPDF(memoData);
    const filename = `MEMO-${order.orderNumber}.pdf`;

    // 6️⃣ Return PDF as download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('[Memo API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to generate memo',
        data: null,
        listData: null,
      },
      { status: 500 }
    );
  }
}
