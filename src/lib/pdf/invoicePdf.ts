/**
 * Invoice PDF Generator
 * 
 * Generates professionally formatted PDF invoices for orders.
 * Uses PDFKit to create A4-sized invoices with proper layout and typography.
 */

import PDFDocument from 'pdfkit';
import puppeteer from 'puppeteer';
import { generateMemoHTML, type MemoData } from './memoHtml';

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
  const html = generateMemoHTML(data);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}




