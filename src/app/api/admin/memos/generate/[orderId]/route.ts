/**
 * POST /api/admin/memos/generate/[orderId]
 * Generate and download PDF invoice for an order
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';
import { generateInvoicePDF, generateInvoiceNumber } from '@/lib/pdf/invoicePdf';
import type { InvoiceOrder, InvoiceItem } from '@/lib/pdf/invoicePdf';

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

    // 4️⃣ Map order data to invoice format
    const invoiceOrder: InvoiceOrder = {
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      subtotal: order.subtotal,
      promoDiscount: order.promoDiscount,
      shippingCost: order.shippingCost,
      total: order.total,
      createdAt: order._creationTime,
    };

    const invoiceItems: InvoiceItem[] = order.items.map(item => ({
      productName: item.productName,
      variantSize: item.variantSize,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    }));

    // 5️⃣ Generate invoice
    const invoiceNumber = generateInvoiceNumber(order.orderNumber);
    const pdfBuffer = await generateInvoicePDF(invoiceNumber, invoiceOrder, invoiceItems);

    // 6️⃣ Return PDF as download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
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
