/**
 * Memo HTML Template
 *
 * generateMemoHTML(data) — returns a full A4-ready HTML string with:
 *   - Memo copy 1
 *   - Dashed cut line
 *   - Memo copy 2 (identical)
 *
 * Plug into any HTML-to-PDF pipeline:
 *   const html = generateMemoHTML(data)
 *   await page.setContent(html)
 *   const pdf = await page.pdf({ format: 'A4', printBackground: true })
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemoItem {
  productName: string;
  sku: string;
  clr: string;
  sz: string;
  qty: number;
  total: number;
}

export interface MemoData {
  invoiceId: string;
  date: string;
  paymentStatus: 'PAID' | 'UNPAID';

  customerName: string;
  phoneNumber: string;
  shippingAddress: string;

  items: MemoItem[];

  delivery: number;
  advDisc: number;
  total: number;

  instruction?: string;
}

// ─── Memo block renderer ──────────────────────────────────────────────────────

export function renderMemo(data: MemoData): string {
  const badgeClass = data.paymentStatus === 'PAID' ? 'paid' : 'unpaid';

  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td>
        <span class="item-name">${item.productName}</span>
        <br/><span class="sku">(${item.sku})</span>
      </td>
      <td>${item.clr || '—'}</td>
      <td>${item.sz || '—'}</td>
      <td>${item.qty}</td>
      <td>${item.total.toFixed(0)}</td>
    </tr>`,
    )
    .join('');

  return `
<div class="memo">

  <!-- ── Header ──────────────────────────────────────────── -->
  <div class="header">
    <div class="brand-wrap">
      <span class="brand-name">ISHTAILE</span>
      <span class="badge ${badgeClass}">${data.paymentStatus}</span>
    </div>
    <div class="company-info">
      <div>+880 1700-000000 &nbsp;|&nbsp; +880 1800-000000</div>
      <div>ishtile.com</div>
    </div>
    <div class="invoice-info">
      <div><strong>Invoice:</strong> ${data.invoiceId}</div>
      <div><strong>Date:</strong> ${data.date}</div>
    </div>
  </div>

  <!-- ── Customer ─────────────────────────────────────────── -->
  <div class="customer">
    <div class="customer-name">${data.customerName}</div>
    <div>${data.phoneNumber}</div>
    <div>${data.shippingAddress}</div>
  </div>

  <!-- ── Items table ──────────────────────────────────────── -->
  <table>
    <thead>
      <tr>
        <th class="th-left">ITEM (SKU)</th>
        <th>CLR</th>
        <th>SZ</th>
        <th>QTY</th>
        <th class="th-right">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- ── Bottom ───────────────────────────────────────────── -->
  <div class="bottom">
    <div class="instruction-box">
      ${data.instruction || 'Handle with care. Do not fold or bend.'}
    </div>
    <div class="totals">
      <div class="totals-row">
        <span>DELIVERY</span>
        <span>${data.delivery.toFixed(0)}</span>
      </div>
      <div class="totals-row">
        <span>ADV/DISC</span>
        <span>${data.advDisc > 0 ? '-' : ''}${data.advDisc.toFixed(0)}</span>
      </div>
      <div class="total-final">
        <span>TOTAL BDT</span>
        <span class="total-amount">${data.total.toFixed(0)}</span>
      </div>
    </div>
  </div>

</div>`;
}

// ─── Full page HTML ───────────────────────────────────────────────────────────

export function generateMemoHTML(data: MemoData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Order Memo — ${data.invoiceId}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      color: #111;
      background: #fff;
      padding: 14px 18px;
    }

    /* ── Memo wrapper ─────────────────────────────────────────── */
    .memo {
      width: 100%;
      padding: 10px 14px 12px;
    }

    /* ── Header ──────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 7px;
      border-bottom: 1px solid #ddd;
      margin-bottom: 7px;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 7px;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 0.1em;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #fff;
    }
    .badge.paid   { background: #22c55e; }
    .badge.unpaid { background: #ef4444; }

    .company-info {
      text-align: center;
      font-size: 8.5px;
      color: #555;
      line-height: 1.75;
    }

    .invoice-info {
      text-align: right;
      font-size: 8.5px;
      line-height: 1.8;
      flex-shrink: 0;
    }

    /* ── Customer ─────────────────────────────────────────────── */
    .customer {
      padding: 5px 0 7px;
      border-bottom: 1px solid #ddd;
      margin-bottom: 7px;
      font-size: 8.5px;
      line-height: 1.75;
    }
    .customer-name {
      font-weight: 700;
      font-size: 10.5px;
    }

    /* ── Items table ──────────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 8.5px;
    }

    thead th {
      text-transform: uppercase;
      font-size: 7.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 3px 4px;
      border-bottom: 1.5px solid #111;
      color: #333;
      text-align: center;
    }
    thead th.th-left  { text-align: left; }
    thead th.th-right { text-align: right; }

    tbody td {
      padding: 4px 4px;
      border-bottom: 1px solid #eee;
      vertical-align: top;
      text-align: center;
    }
    tbody td:first-child { text-align: left; }
    tbody td:last-child  { text-align: right; font-weight: 700; }

    .item-name { font-weight: 600; font-size: 8.5px; }
    .sku       { font-size: 7px; color: #888; }

    /* ── Bottom ───────────────────────────────────────────────── */
    .bottom {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .instruction-box {
      flex: 1;
      border: 1.5px dashed #999;
      padding: 7px 9px;
      font-size: 8px;
      color: #555;
      min-height: 58px;
      line-height: 1.65;
    }

    .totals {
      width: 150px;
      flex-shrink: 0;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      font-weight: 600;
      padding: 3px 0;
      border-bottom: 1px solid #eee;
      color: #333;
    }

    .total-final {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 0 0;
      border-top: 1.5px solid #111;
      margin-top: 4px;
      font-weight: 700;
      font-size: 9.5px;
    }

    .total-amount {
      font-size: 16px;
      font-weight: 900;
    }

    /* ── Cut line ─────────────────────────────────────────────── */
    .cut-line {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 0;
      color: #bbb;
      font-size: 11px;
    }
    .cut-dashes {
      flex: 1;
      border-top: 1.5px dashed #ccc;
    }

    /* ── Print ────────────────────────────────────────────────── */
    @media print {
      body         { padding: 0; }
      @page        { size: A4; margin: 0.9cm; }
      .memo        { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  ${renderMemo(data)}

  <div class="cut-line">
    <span>✂</span>
    <div class="cut-dashes"></div>
  </div>

  ${renderMemo(data)}

</body>
</html>`;
}
