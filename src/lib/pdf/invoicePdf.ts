/**
 * Invoice PDF Generator
 * 
 * Generates professionally formatted PDF invoices for orders.
 * Uses PDFKit to create A4-sized invoices with proper layout and typography.
 */

import PDFDocument from 'pdfkit';
import type { MemoData } from './memoHtml';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceOrder {
  orderNumber: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  subtotal: number;
  promoDiscount: number;
  shippingCost: number;
  total: number;
  createdAt: number | string; // Unix timestamp or ISO string
}

export interface InvoiceItem {
  productName: string;
  variantSize: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceConfig {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

// ─── Default Configuration ────────────────────────────────────────────────────

const DEFAULT_CONFIG: InvoiceConfig = {
  companyName: 'Ishtile',
  companyAddress: 'Dhaka, Bangladesh',
  companyPhone: '+880 1234567890',
  companyEmail: 'info@ishtile.com',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function generateInvoiceNumber(orderNumber: string): string {
  return `INV-${orderNumber}`;
}

function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── PDF Rendering ────────────────────────────────────────────────────────────

export async function generateInvoicePDF(
  invoiceNumber: string,
  order: InvoiceOrder,
  items: InvoiceItem[],
  config: InvoiceConfig = DEFAULT_CONFIG
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ─── Layout Constants ──────────────────────────────────────────
    const pageWidth = 595.28 - 120; // A4 width minus margins
    const leftCol = 60;
    const rightCol = 400;

    // ─── Header ────────────────────────────────────────────────────
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text('INVOICE', { align: 'right' });
    
    doc.fontSize(10)
       .font('Helvetica')
       .text(invoiceNumber, { align: 'right' });
    
    doc.moveDown(2);

    // ─── Company Info (Left) ───────────────────────────────────────
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text(config.companyName, leftCol, 120);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(config.companyAddress, leftCol, 140)
       .text(config.companyPhone, leftCol, 155)
       .text(config.companyEmail, leftCol, 170);

    // ─── Order Details (Right) ─────────────────────────────────────
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .text('Order Number:', rightCol, 140, { continued: true })
       .font('Helvetica')
       .text(` ${order.orderNumber}`);
    
    doc.font('Helvetica-Bold')
       .text('Date:', rightCol, 155, { continued: true })
       .font('Helvetica')
       .text(` ${formatDate(order.createdAt)}`);

    doc.moveDown(3);

    // ─── Bill To ───────────────────────────────────────────────────
    const billToY = doc.y;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('BILL TO:', leftCol, billToY);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text(order.shippingName, leftCol, billToY + 20)
       .text(order.shippingPhone, leftCol, billToY + 35)
       .text(order.shippingAddress, leftCol, billToY + 50, { width: 250 })
       .text(order.shippingCity, leftCol, billToY + 80);

    doc.moveDown(4);

    // ─── Items Table ───────────────────────────────────────────────
    const tableTop = doc.y + 20;
    const tableHeaders = ['Item', 'Qty', 'Unit Price', 'Total'];
    const colWidths = [260, 60, 90, 90];
    const colPositions = [leftCol, leftCol + 260, leftCol + 320, leftCol + 410];

    // Table header
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#333333');
    
    tableHeaders.forEach((header, i) => {
      doc.text(header, colPositions[i], tableTop, { 
        width: colWidths[i], 
        align: i === 0 ? 'left' : 'right' 
      });
    });

    // Header underline
    doc.moveTo(leftCol, tableTop + 15)
       .lineTo(leftCol + pageWidth, tableTop + 15)
       .strokeColor('#cccccc')
       .stroke();

    // Table rows
    let rowY = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    items.forEach((item) => {
      const itemName = `${item.productName} (${item.variantSize})`;
      
      doc.fillColor('#000000')
         .text(itemName, colPositions[0], rowY, { width: colWidths[0] })
         .text(item.quantity.toString(), colPositions[1], rowY, { 
           width: colWidths[1], 
           align: 'right' 
         })
         .text(`BDT ${item.unitPrice.toFixed(2)}`, colPositions[2], rowY, { 
           width: colWidths[2], 
           align: 'right' 
         })
         .text(`BDT ${item.lineTotal.toFixed(2)}`, colPositions[3], rowY, { 
           width: colWidths[3], 
           align: 'right' 
         });
      
      rowY += 20;
    });

    // ─── Totals Section ────────────────────────────────────────────
    const totalsX = rightCol;
    const totalsY = rowY + 30;

    doc.moveTo(totalsX, totalsY - 10)
       .lineTo(leftCol + pageWidth, totalsY - 10)
       .strokeColor('#cccccc')
       .stroke();

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#000000')
       .text('Subtotal:', totalsX, totalsY, { continued: true, width: 90 })
       .text(`BDT ${order.subtotal.toFixed(2)}`, { align: 'right', width: 90 });

    if (order.promoDiscount > 0) {
      doc.text('Discount:', totalsX, totalsY + 20, { continued: true, width: 90 })
         .text(`-BDT ${order.promoDiscount.toFixed(2)}`, { align: 'right', width: 90 });
    }

    doc.text('Shipping:', totalsX, totalsY + 40, { continued: true, width: 90 })
       .text(`BDT ${order.shippingCost.toFixed(2)}`, { align: 'right', width: 90 });

    // Total line
    doc.moveTo(totalsX, totalsY + 60)
       .lineTo(leftCol + pageWidth, totalsY + 60)
       .strokeColor('#000000')
       .lineWidth(1.5)
       .stroke();

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .text('TOTAL:', totalsX, totalsY + 70, { continued: true, width: 90 })
       .text(`BDT ${order.total.toFixed(2)}`, { align: 'right', width: 90 });

    // ─── Footer ────────────────────────────────────────────────────
    doc.fontSize(8)
       .font('Helvetica-Oblique')
       .fillColor('#666666')
       .text('Thank you for your business!', leftCol, 750, { 
         align: 'center', 
         width: pageWidth 
       });

    doc.end();
  });
}

// ─── Memo PDF (two-copy A4 layout) ───────────────────────────────────────────

export async function generateMemoPDF(data: MemoData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 14, bottom: 14, left: 18, right: 18 },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const L = 18;           // left margin (px from page left)
    const R = 595.28 - 18;  // right edge  = 577.28
    const W = R - L;        // content width = 559.28

    // ── Draw one memo copy ───────────────────────────────────────────────────
    function drawMemo(startY: number): void {
      let y = startY;

      // ═══ HEADER ═══════════════════════════════════════════════════════════
      doc.fontSize(17).font('Helvetica-Bold').fillColor('#000000')
         .text('ISHTILE', L, y, { lineBreak: false });

      // payment status badge (filled rect + text)
      const badgeX     = L + 92;
      const badgeColor = data.paymentStatus === 'PAID' ? '#22c55e' : '#ef4444';
      doc.save();
      doc.rect(badgeX, y, 40, 13).fill(badgeColor);
      doc.restore();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
         .text(data.paymentStatus, badgeX, y + 1.5, { width: 40, align: 'center', lineBreak: false });

      // company info (centred)
      doc.fontSize(8).font('Helvetica').fillColor('#555555')
         .text('+880 1700-000000  |  +880 1800-000000', L + 165, y, {
           width: 215, align: 'center', lineBreak: false,
         });
      doc.text('ishtile.com', L + 165, y + 13, {
        width: 215, align: 'center', lineBreak: false,
      });

      // invoice info (right-aligned)
      doc.fontSize(8).font('Helvetica').fillColor('#000000')
         .text(`Invoice: ${data.invoiceId}`, L + 385, y, {
           width: W - 385, align: 'right', lineBreak: false,
         });
      doc.text(`Date: ${data.date}`, L + 385, y + 13, {
        width: W - 385, align: 'right', lineBreak: false,
      });

      y += 36;
      doc.moveTo(L, y).lineTo(R, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
      y += 7;

      // ═══ CUSTOMER ══════════════════════════════════════════════════════════
      doc.fontSize(10.5).font('Helvetica-Bold').fillColor('#000000')
         .text(data.customerName, L, y, { lineBreak: false });
      y += 14;
      doc.fontSize(8.5).font('Helvetica').fillColor('#000000')
         .text(data.phoneNumber, L, y, { lineBreak: false });
      y += 12;
      doc.text(data.shippingAddress, L, y, { lineBreak: false });
      y += 14;
      doc.moveTo(L, y).lineTo(R, y).strokeColor('#dddddd').lineWidth(0.5).stroke();
      y += 7;

      // ═══ ITEM TABLE ════════════════════════════════════════════════════════
      const cItem  = L;         // width 240
      const cClr   = L + 245;   // width 45
      const cSz    = L + 295;   // width 45
      const cQty   = L + 345;   // width 45
      const cTotal = L + 395;   // to R

      // table header
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#333333');
      doc.text('ITEM (SKU)', cItem,  y, { width: 240,           lineBreak: false });
      doc.text('CLR',        cClr,   y, { width: 45, align: 'center', lineBreak: false });
      doc.text('SZ',         cSz,    y, { width: 45, align: 'center', lineBreak: false });
      doc.text('QTY',        cQty,   y, { width: 45, align: 'center', lineBreak: false });
      doc.text('TOTAL',      cTotal, y, { width: R - cTotal, align: 'right', lineBreak: false });
      y += 12;
      doc.moveTo(L, y).lineTo(R, y).strokeColor('#111111').lineWidth(1.5).stroke();
      y += 4;

      // table rows
      for (const item of data.items) {
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#000000')
           .text(item.productName, cItem, y, { width: 240, lineBreak: false });
        if (item.sku) {
          doc.fontSize(7).font('Helvetica').fillColor('#888888')
             .text(`(${item.sku})`, cItem, y + 10, { width: 240, lineBreak: false });
        }
        doc.fontSize(8.5).font('Helvetica').fillColor('#000000')
           .text(item.clr || '\u2014', cClr,  y, { width: 45, align: 'center', lineBreak: false });
        doc.text(item.sz   || '\u2014', cSz,   y, { width: 45, align: 'center', lineBreak: false });
        doc.text(String(item.qty),      cQty,  y, { width: 45, align: 'center', lineBreak: false });
        doc.fontSize(8.5).font('Helvetica-Bold').fillColor('#000000')
           .text(item.total.toFixed(0), cTotal, y, { width: R - cTotal, align: 'right', lineBreak: false });
        y += 20;
        doc.moveTo(L, y - 4).lineTo(R, y - 4).strokeColor('#eeeeee').lineWidth(0.5).stroke();
      }
      y += 6;

      // ═══ BOTTOM ════════════════════════════════════════════════════════════
      const instrW = Math.floor(W * 0.54);
      const totW   = 150;
      const totX   = R - totW;
      const boxH   = 58;

      // instruction box (dashed border)
      doc.save();
      doc.rect(L, y, instrW, boxH).dash(3, { space: 3 }).strokeColor('#999999').lineWidth(1).stroke();
      doc.restore();
      doc.fontSize(8).font('Helvetica').fillColor('#555555')
         .text(
           data.instruction || 'Handle with care. Do not fold or bend.',
           L + 7, y + 7,
           { width: instrW - 14, height: boxH - 14, lineBreak: true },
         );

      // totals
      let ty = y;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333')
         .text('DELIVERY', totX, ty, { width: 80, lineBreak: false });
      doc.font('Helvetica')
         .text(data.delivery.toFixed(0), totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });
      ty += 14;
      doc.moveTo(totX, ty - 3).lineTo(R, ty - 3).strokeColor('#eeeeee').lineWidth(0.5).stroke();

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#333333')
         .text('ADV/DISC', totX, ty, { width: 80, lineBreak: false });
      const disc = `${data.advDisc > 0 ? '-' : ''}${data.advDisc.toFixed(0)}`;
      doc.font('Helvetica')
         .text(disc, totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });
      ty += 14;
      doc.moveTo(totX, ty).lineTo(R, ty).strokeColor('#111111').lineWidth(1.5).stroke();
      ty += 5;

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#000000')
         .text('TOTAL BDT', totX, ty, { width: 75, lineBreak: false });
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
         .text(data.total.toFixed(0), totX + 75, ty - 3, { width: totW - 75, align: 'right', lineBreak: false });
    }

    // ── Dynamic height so the two copies don't overlap ───────────────────────
    // header=43  customer=47  table-header=16  rows=n*20  gap=6  bottom=70
    const memoH      = 43 + 47 + 16 + data.items.length * 20 + 6 + 70;
    const memo1Start = 14;
    const cutY       = memo1Start + memoH + 8;
    const memo2Start = cutY + 14;

    drawMemo(memo1Start);

    // cut line between copies
    doc.moveTo(L, cutY).lineTo(R, cutY)
       .dash(4, { space: 4 }).strokeColor('#cccccc').lineWidth(1).stroke()
       .undash();

    drawMemo(memo2Start);

    doc.end();
  });
}




