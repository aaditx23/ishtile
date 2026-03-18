/**
 * POST /api/admin/memos/batch
 * Generate one combined A4 PDF containing all selected orders.
 * Body: { orderIds: string[] }   ← Convex Id<'orders'>[]
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../convex/_generated/api';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { verifyToken } from '@/lib/auth';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import type { MemoData } from '@/lib/pdf/memoHtml';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ─── Layout constants ─────────────────────────────────────────────────────────

const PAGE_H       = 841.89;
const MARGIN_TOP   = 40;
const MARGIN_BOTTOM = 40;
const L            = 40;
const R            = 595.28 - 40;
const W            = R - L;

// Estimated section heights after slight font reduction
const BRAND_H      = 77;   // ISHTILE line → thick divider
const CUSTOMER_H   = 55;   // name + phone + address + gap
const TABLE_HDR_H  = 20;   // column labels + underline
const ROW_H        = 26;   // one item row
const BOTTOM_H     = 110;  // totals + instruction + policies

const USABLE_H     = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM; // 761.89
const MIN_START    = BRAND_H + CUSTOMER_H + TABLE_HDR_H + ROW_H; // min space to start an order

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rem(doc: InstanceType<typeof PDFDocument>): number {
  return PAGE_H - MARGIN_BOTTOM - doc.y;
}

// Draw ISHTILE brand header + contact row + payment badge + thick divider.
// Returns updated y after the divider.
function drawBrandHeader(
  doc: InstanceType<typeof PDFDocument>,
  data: MemoData,
  y: number,
): number {
  // Brand name (left) + Invoice ID (right)
  doc.fontSize(20).font('Helvetica-BoldOblique').fillColor('#000000')
     .text('ISHTILE', L, y, { lineBreak: false });
  doc.fontSize(15).font('Helvetica-Bold').fillColor('#000000')
     .text(data.invoiceId, L, y, { width: W, align: 'right', lineBreak: false });
  y += 22;

  // Contact icons + links
  const callIconPath = path.join(process.cwd(), 'public/images/icons/call.png');
  const waIconPath   = path.join(process.cwd(), 'public/images/icons/whatsapp.png');
  const webIconPath  = path.join(process.cwd(), 'public/images/icons/website.png');

  let cx = L;
  if (fs.existsSync(callIconPath))  doc.image(callIconPath, cx, y + 1, { width: 8, height: 8 });
  cx += 11;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#000000')
     .text('+880-017-433-20518', cx, y + 2, { lineBreak: false });
  cx += 77;
  if (fs.existsSync(waIconPath)) doc.image(waIconPath, cx, y + 1, { width: 8, height: 8 });
  cx += 11;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#000000')
     .text('+880-016-079-9906', cx, y + 2, { lineBreak: false });
  cx += 77;
  if (fs.existsSync(webIconPath)) doc.image(webIconPath, cx, y + 1, { width: 8, height: 8 });
  cx += 11;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#000000')
     .text('https://ishtile.com', cx, y + 2, { lineBreak: false });

  // Date (right)
  doc.fontSize(8).font('Helvetica').fillColor('#999999')
     .text(data.date, L, y + 1.5, { width: W, align: 'right', lineBreak: false });
  y += 15;

  // Payment badge
  const badgeColor = data.paymentStatus === 'PAID' ? '#22c55e' : '#000000';
  doc.save();
  doc.rect(L, y, 40, 12).fill(badgeColor);
  doc.restore();
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff')
     .text(data.paymentStatus, L, y + 2.5, { width: 40, align: 'center', lineBreak: false });
  y += 22;

  // Thick divider
  doc.moveTo(L, y).lineTo(R, y).strokeColor('#000000').lineWidth(2).stroke();
  y += 18;

  return y; // y ≈ startY + BRAND_H
}

// Draw customer name, phone, address. Returns updated y after the gap.
function drawCustomerBlock(
  doc: InstanceType<typeof PDFDocument>,
  data: MemoData,
  y: number,
): number {
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
     .text(data.customerName.toUpperCase(), L, y, { lineBreak: false });
  y += 18;
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#888888')
     .text(data.phoneNumber, L, y, { lineBreak: false });
  y += 14;
  // Address may wrap — read doc.y afterwards
  doc.fontSize(8.5).font('Helvetica').fillColor('#bbbbbb')
     .text(data.shippingAddress.toUpperCase(), L, y, { width: W });
  y = doc.y + 20;
  return y;
}

// Draw the table column header row. Returns updated y.
function drawTableHeader(
  doc: InstanceType<typeof PDFDocument>,
  y: number,
): number {
  const cItem  = L;
  const cClr   = L + 280;
  const cSz    = L + 340;
  const cQty   = L + 390;
  const cTotal = L + 440;

  doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
  doc.text('ITEM (SKU)', cItem,  y, { width: 270,          lineBreak: false });
  doc.text('CLR',        cClr,  y, { width: 50,  align: 'center', lineBreak: false });
  doc.text('SZ',         cSz,   y, { width: 40,  align: 'center', lineBreak: false });
  doc.text('QTY',        cQty,  y, { width: 40,  align: 'center', lineBreak: false });
  doc.text('TOTAL',      cTotal, y, { width: R - cTotal, align: 'right', lineBreak: false });
  y += 12;
  doc.moveTo(L, y).lineTo(R, y).strokeColor('#000000').lineWidth(1).stroke();
  y += 8;
  return y;
}

// Draw one item row. Returns updated y.
function drawItemRow(
  doc: InstanceType<typeof PDFDocument>,
  item: MemoData['items'][number],
  y: number,
): number {
  const cItem  = L;
  const cClr   = L + 280;
  const cSz    = L + 340;
  const cQty   = L + 390;
  const cTotal = L + 440;

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
     .text(item.productName, cItem, y, { width: 270, lineBreak: false });
  if (item.sku) {
    doc.fontSize(7).font('Helvetica').fillColor('#888888')
       .text(`(${item.sku})`, cItem, y + 11, { width: 270, lineBreak: false });
  }
  doc.fontSize(9).font('Helvetica').fillColor('#000000')
     .text(item.clr || '\u2014', cClr,  y, { width: 50,           align: 'center', lineBreak: false })
     .text(item.sz  || '\u2014', cSz,   y, { width: 40,           align: 'center', lineBreak: false })
     .text(String(item.qty),     cQty,  y, { width: 40,           align: 'center', lineBreak: false });
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
     .text(item.total.toFixed(0), cTotal, y, { width: R - cTotal, align: 'right',  lineBreak: false });

  return y + ROW_H;
}

// Draw the bottom section (instruction box + policies + totals).
function drawBottomSection(
  doc: InstanceType<typeof PDFDocument>,
  data: MemoData,
  y: number,
): void {
  y += 15;
  const instrW = 220;
  const boxH   = 50;
  const totW   = 160;
  const totX   = R - totW;

  // Instruction label + dashed box
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#aaaaaa')
     .text('INSTRUCTION', L, y - 4);
  doc.save();
  doc.rect(L + 75, y - 10, instrW, boxH).dash(3, { space: 3 }).strokeColor('#000000').lineWidth(1).stroke();
  doc.restore();
  doc.fontSize(8).font('Helvetica').fillColor('#333333')
     .text(data.instruction || '', L + 80, y - 5, { width: instrW - 10, height: boxH - 10, lineBreak: true });

  // Policies
  const policyY = y + boxH;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#000000').text('POLICIES', L, policyY);
  doc.fontSize(6.5).font('Helvetica').fillColor('#777777')
     .text('• No return after 7 days',                               L, policyY + 11)
     .text('• Contact WhatsApp for any exchange related queries.',    L, policyY + 20)
     .text('• Delivery fees must be paid if returned',               L, policyY + 29);

  // Totals (right column)
  let ty = y - 4;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#aaaaaa')
     .text('DELIVERY', totX, ty, { width: 80, lineBreak: false });
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000')
     .text(data.delivery.toFixed(0), totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });
  ty += 16;

  const disc = `${data.advDisc > 0 ? '-' : ''}${data.advDisc.toFixed(0)}`;
  doc.fontSize(7).font('Helvetica-Bold').fillColor('#aaaaaa')
     .text('ADV/DISC', totX, ty, { width: 80, lineBreak: false });
  doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000')
     .text(disc, totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });
  ty += 16;

  doc.moveTo(totX, ty).lineTo(R, ty).strokeColor('#000000').lineWidth(1).stroke();
  ty += 12;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
     .text('TOTAL BDT', totX, ty + 4, { width: 80, lineBreak: false });
  doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
     .text(data.total.toFixed(0), totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });
}

// ─── Order separator ─────────────────────────────────────────────────────────

const SEP_H = 20; // 8px gap above + 4px line + 8px gap below

/**
 * Draw a thin dotted horizontal rule between two orders.
 * Must only be called between orders (not before first, not after last).
 * If there isn't enough room for the separator + header + 1 row of the next
 * order, skip drawing it — renderOrderOntoDoc will addPage() itself.
 */
function drawOrderSeparator(doc: InstanceType<typeof PDFDocument>): void {
  const space = rem(doc);
  // If remaining space can't fit separator + minimum order start, don't draw
  if (space < SEP_H + MIN_START) return;

  const sepY = doc.y + 8; // 8px breathing room above the line
  doc
    .save()
    .lineWidth(0.5)
    .strokeColor('#aaaaaa')
    .dash(2, { space: 2 })
    .moveTo(L, sepY)
    .lineTo(R, sepY)
    .stroke()
    .undash()
    .restore();

  doc.y = sepY + 8; // 8px breathing room below the line
}

// ─── Core renderer ────────────────────────────────────────────────────────────

/**
 * Render one order onto an existing PDFDocument, handling all pagination:
 *  1. Orphan-header guard — don't start an order if header + 1 row won't fit.
 *  2. Keep-together — if the whole order fits on a fresh page, start there.
 *  3. Large-order splitting — orders > 1 page continue across pages with header repeated.
 *  4. Per-row overflow guard — addPage + re-draw header before each row that won't fit.
 */
function renderOrderOntoDoc(
  doc: InstanceType<typeof PDFDocument>,
  data: MemoData,
  isFirstOrder: boolean,
): void {
  const fullOrderH = BRAND_H + CUSTOMER_H + TABLE_HDR_H + data.items.length * ROW_H + BOTTOM_H;

  // ── Placement decision (only needed after the first order) ──────────────────
  if (!isFirstOrder) {
    const space = rem(doc);

    if (space < MIN_START) {
      // Rule 1: not enough room for even header + 1 row → new page
      doc.addPage();
    } else if (fullOrderH > space && fullOrderH <= USABLE_H) {
      // Rule 2: order doesn't fit here but fits on a fresh page → keep it together
      doc.addPage();
    }
    // Rule 3: order > 1 page → start wherever we are and split across pages below
  }

  // ── Draw header + customer + table header ───────────────────────────────────
  let y = doc.y;
  y = drawBrandHeader(doc, data, y);
  y = drawCustomerBlock(doc, data, y);
  y = drawTableHeader(doc, y);

  // ── Draw item rows with per-row overflow guard (Rule 4) ─────────────────────
  for (const item of data.items) {
    // Update doc.y so rem() is accurate before each row
    doc.y = y;

    if (rem(doc) < ROW_H) {
      // Not enough space for this row → overflow to next page
      doc.addPage();
      y = doc.y; // = MARGIN_TOP after addPage
      y = drawBrandHeader(doc, data, y);  // repeat brand header (same order ID)
      y = drawTableHeader(doc, y);         // repeat column headers
      doc.y = y;
    }

    y = drawItemRow(doc, item, y);
  }

  // ── Bottom section ─────────────────────────────────────────────────────────
  doc.y = y;
  if (rem(doc) < BOTTOM_H) {
    // Totals don't fit → push to a new page
    doc.addPage();
    y = doc.y;
    y = drawBrandHeader(doc, data, y); // repeat header so the page isn't blank
    doc.y = y;
  }

  drawBottomSection(doc, data, y);

  // Advance doc.y past the bottom block so the next order's rem() is correct
  doc.y = y + BOTTOM_H;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 1️⃣ Auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null, listData: null },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    let payload;
    try {
      payload = await verifyToken(token);
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

    // 2️⃣ Parse body
    let body: { orderIds?: string[] };
    try {
      const rawText = await req.text();
      body = rawText ? JSON.parse(rawText) : {};
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty request body', data: null, listData: null },
        { status: 400 },
      );
    }
    const orderIds: Id<'orders'>[] = (body.orderIds ?? []) as Id<'orders'>[];

    if (!orderIds.length) {
      return NextResponse.json(
        { success: false, message: 'No order IDs provided', data: null, listData: null },
        { status: 400 },
      );
    }

    // 3️⃣ Fetch all orders in parallel
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
        { success: false, message: 'No valid orders found', data: null, listData: null },
        { status: 404 },
      );
    }

    // 4️⃣ Sort by item count ascending (fewest items first → better page packing)
    orders.sort((a, b) => (a.items?.length ?? 0) - (b.items?.length ?? 0));

    // 5️⃣ Map to MemoData
    const memoDatas: MemoData[] = orders.map((order) => ({
      invoiceId:       order.orderNumber,
      date:            new Date(order._creationTime).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
      paymentStatus:   order.isPaid ? 'PAID' : 'UNPAID',
      customerName:    order.shippingName,
      phoneNumber:     order.shippingPhone,
      shippingAddress: [order.shippingAddress, order.shippingCity].filter(Boolean).join(', '),
      items:           (order.items ?? []).map((item) => ({
        productName: item.productName,
        sku:         item.variantSku  ?? '',
        clr:         item.variantColor ?? '',
        sz:          item.variantSize  ?? '',
        qty:         item.quantity,
        total:       item.lineTotal,
      })),
      delivery:    order.shippingCost,
      advDisc:     order.promoDiscount,
      total:       order.total,
      instruction: order.customerNotes ?? '',
    }));

    // 6️⃣ Render all orders into one PDFDocument
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MARGIN_TOP, bottom: MARGIN_BOTTOM, left: L, right: R },
        autoFirstPage: true,
      });

      const buffers: Buffer[] = [];
      doc.on('data',  (chunk: Buffer) => buffers.push(chunk));
      doc.on('end',   () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      memoDatas.forEach((memo, idx) => {
        if (idx > 0) drawOrderSeparator(doc); // separator between orders only
        renderOrderOntoDoc(doc, memo, idx === 0);
      });

      doc.end();
    });

    // 7️⃣ Return combined PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': 'attachment; filename="MEMOS-batch.pdf"',
        'Content-Length':      pdfBuffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('[Batch Memo API] Error:', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to generate batch memo',
        data: null,
        listData: null,
      },
      { status: 500 },
    );
  }
}
