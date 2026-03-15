/**
 * Invoice PDF Generator
 * 
 * Generates professionally formatted PDF invoices for orders.
 * Uses PDFKit to create A4-sized invoices with proper layout and typography.
 */

import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
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

export async function generateMemoPDF(data: MemoData): Promise<Buffer> {
   return new Promise((resolve, reject) => {
      // Calculate exactly how tall this needs to be
      const baseHeight = 330; // headers + customer + table top + padding
      const rowsHeight = data.items.length * 30; // table items
      const bottomHeight = 150; // instruction, policies, totals
      const totalRequiredHeight = baseHeight + rowsHeight + bottomHeight;

      const doc = new PDFDocument({
         size: [595.28, totalRequiredHeight], // Exact custom height A4 width
         margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const L = 40;           // left margin
      const R = 595.28 - 40;  // right edge
      const W = R - L;        // content width

      let y = 40;

      // ═══ HEADER ═══════════════════════════════════════════════════════════

      // Line 1: ISHTILE (Left) & Invoice (Right)
      doc.fontSize(24).font('Helvetica-BoldOblique').fillColor('#000000')
         .text('ISHTILE', L, y, { lineBreak: false });

      doc.fontSize(18).font('Helvetica-Bold').fillColor('#000000')
         .text(data.invoiceId, L, y, { width: W, align: 'right', lineBreak: false });

      y += 26;

      // Contact Numbers & Website
      // Render icons using PDFKit image method. Use path.join with process.cwd() for Vercel production compatibility
      const callIconPath = path.join(process.cwd(), 'public/images/icons/call.png');
      const waIconPath = path.join(process.cwd(), 'public/images/icons/whatsapp.png');
      const webIconPath = path.join(process.cwd(), 'public/images/icons/website.png');

      let currentX = L;

      // First phone (call)
      if (fs.existsSync(callIconPath)) {
         doc.image(callIconPath, currentX, y + 1.5, { width: 9, height: 9 });
      }
      currentX += 13;
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#000000')
         .text('+880-017-433-20518', currentX, y + 3, { lineBreak: false });

      currentX += 80;

      // Second phone (whatsapp)
      if (fs.existsSync(waIconPath)) {
         doc.image(waIconPath, currentX, y + 1.5, { width: 9, height: 9 });
      }
      currentX += 13;
      doc.text('+880-016-079-9906', currentX, y + 3, { lineBreak: false });

      currentX += 80;

      // Website
      if (fs.existsSync(webIconPath)) {
         doc.image(webIconPath, currentX, y + 1.5, { width: 9, height: 9 });
      }
      currentX += 13;
      doc.text('https://ishtile.com', currentX, y + 3, { lineBreak: false });

      // Date
      doc.fontSize(9).font('Helvetica').fillColor('#999999')
         .text(data.date, L, y + 2.5, { width: W, align: 'right', lineBreak: false });

      y += 18;

      // Line 3: Badge (PAID / UNPAID)
      const badgeColor = data.paymentStatus === 'PAID' ? '#22c55e' : '#000000';
      doc.save();
      doc.rect(L, y, 45, 14).fill(badgeColor);
      doc.restore();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#ffffff')
         .text(data.paymentStatus, L, y + 3, { width: 45, align: 'center', lineBreak: false });

      y += 25;

      // Thick Divider
      doc.moveTo(L, y).lineTo(R, y).strokeColor('#000000').lineWidth(2).stroke();
      y += 20;

      // ═══ CUSTOMER ══════════════════════════════════════════════════════════
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
         .text(data.customerName.toUpperCase(), L, y, { lineBreak: false });
      y += 22;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#888888')
         .text(data.phoneNumber, L, y, { lineBreak: false });
      y += 18;
      doc.fontSize(10).font('Helvetica').fillColor('#bbbbbb')
         .text(data.shippingAddress.toUpperCase(), L, y, { width: W });

      y = doc.y + 30;

      // ═══ ITEM TABLE ════════════════════════════════════════════════════════
      const cItem = L;
      const cClr = L + 280;
      const cSz = L + 340;
      const cQty = L + 390;
      const cTotal = L + 440;

      // Header
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');
      doc.text('ITEM (SKU)', cItem, y, { width: 270, lineBreak: false });
      doc.text('CLR', cClr, y, { width: 50, align: 'center', lineBreak: false });
      doc.text('SZ', cSz, y, { width: 40, align: 'center', lineBreak: false });
      doc.text('QTY', cQty, y, { width: 40, align: 'center', lineBreak: false });
      doc.text('TOTAL', cTotal, y, { width: R - cTotal, align: 'right', lineBreak: false });

      y += 14;
      doc.moveTo(L, y).lineTo(R, y).strokeColor('#000000').lineWidth(1).stroke();
      y += 10;

      // Table rows
      for (const item of data.items) {
         doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
            .text(item.productName, cItem, y, { width: 270, lineBreak: false });
         if (item.sku) {
            doc.fontSize(8).font('Helvetica').fillColor('#888888')
               .text(`(${item.sku})`, cItem, y + 12, { width: 270, lineBreak: false });
         }
         doc.fontSize(10).font('Helvetica').fillColor('#000000')
            .text(item.clr || '\u2014', cClr, y, { width: 50, align: 'center', lineBreak: false });
         doc.text(item.sz || '\u2014', cSz, y, { width: 40, align: 'center', lineBreak: false });
         doc.text(String(item.qty), cQty, y, { width: 40, align: 'center', lineBreak: false });
         doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
            .text(item.total.toFixed(0), cTotal, y, { width: R - cTotal, align: 'right', lineBreak: false });

         y += 30;
      }

      // ═══ BOTTOM ════════════════════════════════════════════════════════════
      // Place right under the table with some breathing room
      y += 20;

      const instrW = 240;
      const boxH = 60;
      const totW = 160;
      const totX = R - totW;

      // Instruction Box
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#aaaaaa')
         .text('INSTRUCTION', L, y - 5);

      doc.save();
      doc.rect(L + 75, y - 12, instrW, boxH).dash(3, { space: 3 }).strokeColor('#000000').lineWidth(1).stroke();
      doc.restore();

      doc.fontSize(9).font('Helvetica').fillColor('#333333')
         .text(
            data.instruction || '',
            L + 80, y - 6,
            { width: instrW - 10, height: boxH - 10, lineBreak: true },
         );

      // Terms & Policies
      const policyY = y + 60;
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000')
         .text('POLICIES', L, policyY);

      doc.fontSize(7).font('Helvetica').fillColor('#777777')
         .text('• No return after 7 days', L, policyY + 12)
         .text('• Contact WhatsApp for any exchange related queries.', L, policyY + 22)
         .text('• Delivery fees must be paid if returned', L, policyY + 32);

      // Totals Section
      let ty = y - 5;

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#aaaaaa')
         .text('DELIVERY', totX, ty, { width: 80, lineBreak: false });
      doc.fontSize(9).font('Helvetica-Bold')
         .text(data.delivery.toFixed(0), totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });

      ty += 20;

      doc.fontSize(8).font('Helvetica-Bold').fillColor('#aaaaaa')
         .text('ADV/DISC', totX, ty, { width: 80, lineBreak: false });
      const disc = `${data.advDisc > 0 ? '-' : ''}${data.advDisc.toFixed(0)}`;
      doc.fontSize(9).font('Helvetica-Bold')
         .text(disc, totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });

      ty += 20;

      // Thin separator above total
      doc.moveTo(totX, ty).lineTo(R, ty).strokeColor('#000000').lineWidth(1).stroke();
      ty += 15;

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
         .text('TOTAL BDT', totX, ty + 5, { width: 80, lineBreak: false });
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000')
         .text(data.total.toFixed(0), totX + 80, ty, { width: totW - 80, align: 'right', lineBreak: false });

      doc.end();
   });
}

