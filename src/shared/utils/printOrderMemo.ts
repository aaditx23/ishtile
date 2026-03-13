import type { Order } from '@/domain/order/order.entity';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

const STATUS_LABELS: Record<string, string> = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

export function printOrderMemo(order: Order): void {
  const date = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const printDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const itemRows = (order.items ?? []).map((item) => `
    <tr>
      <td>${item.productName}</td>
      <td style="color:#666">${[item.variantSize, item.variantColor].filter(Boolean).join(' / ')}</td>
      <td class="num">${item.quantity}</td>
      <td class="num">${fmt(item.unitPrice)}</td>
      <td class="num bold">${fmt(item.lineTotal)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order Memo — #${order.orderNumber}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      padding: 2.5rem;
      max-width: 760px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 1.25rem;
      border-bottom: 2px solid #1a1a1a;
      margin-bottom: 1.5rem;
    }
    .brand {
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .memo-title {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #888;
      margin-top: 0.25rem;
    }
    .header-right {
      text-align: right;
      font-size: 0.8rem;
      color: #555;
      line-height: 1.6;
    }
    .header-right strong {
      font-size: 1rem;
      color: #1a1a1a;
      font-weight: 700;
    }

    /* ── Status badge ── */
    .status {
      display: inline-block;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid #1a1a1a;
      background: transparent;
      margin-left: 0.5rem;
      vertical-align: middle;
    }

    /* ── Two-column meta ── */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .meta-block h3 {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 0.4rem;
    }
    .meta-block p {
      font-size: 0.82rem;
      line-height: 1.55;
    }
    .meta-block p strong { font-weight: 600; }

    /* ── Items table ── */
    .section-heading {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.5rem;
    }
    thead tr {
      border-bottom: 1.5px solid #1a1a1a;
    }
    thead th {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.4rem 0.5rem;
      text-align: left;
      color: #555;
    }
    thead th.num, tbody td.num { text-align: right; }
    tbody tr { border-bottom: 1px solid #e8e8e8; }
    tbody td {
      padding: 0.55rem 0.5rem;
      font-size: 0.82rem;
      vertical-align: top;
    }
    tbody td.bold { font-weight: 600; }
    tbody td:first-child { font-weight: 600; }

    /* ── Totals ── */
    .totals {
      width: 240px;
      margin-left: auto;
      margin-bottom: 1.5rem;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      padding: 0.3rem 0;
      color: #555;
    }
    .totals-row span:last-child { font-weight: 500; color: #1a1a1a; }
    .totals-divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 0.3rem 0;
    }
    .totals-total {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 0.3rem 0;
    }
    .totals-payment {
      font-size: 0.75rem;
      color: #888;
      text-align: right;
      margin-top: 0.25rem;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #ddd;
      padding-top: 0.875rem;
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      color: #aaa;
    }

    @media print {
      body { padding: 1.25rem; }
      @page { size: A4; margin: 1.5cm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div>
      <div class="brand">Ishtile</div>
      <div class="memo-title">Order Memo</div>
    </div>
    <div class="header-right">
      <strong>#${order.orderNumber}</strong>
      <span class="status">${STATUS_LABELS[order.status] ?? order.status}</span>
      <br/>
      <span>${date}</span>
    </div>
  </div>

  <!-- Meta: shipping + order info -->
  <div class="meta-grid">
    <div class="meta-block">
      <h3>Deliver To</h3>
      <p>
        <strong>${order.shippingName}</strong><br/>
        ${order.shippingPhone}<br/>
        ${order.shippingAddress}<br/>
        ${order.shippingCity}${order.shippingPostalCode ? ` — ${order.shippingPostalCode}` : ''}
        ${order.customerNotes ? `<br/><em style="color:#888">Note: ${order.customerNotes}</em>` : ''}
      </p>
    </div>
    <div class="meta-block">
      <h3>Order Info</h3>
      <p>
        <strong>Order #</strong> ${order.orderNumber}<br/>
        <strong>Date</strong> ${date}<br/>
        <strong>Payment</strong> ${order.isPaid ? 'Paid' : 'Cash on Delivery (COD)'}<br/>
        <strong>Status</strong> ${STATUS_LABELS[order.status] ?? order.status}
      </p>
    </div>
  </div>

  <!-- Items -->
  <p class="section-heading">Items Ordered</p>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>Variant</th>
        <th class="num">Qty</th>
        <th class="num">Unit Price</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
    ${order.promoDiscount > 0 ? `<div class="totals-row"><span>Promo discount</span><span>− ${fmt(order.promoDiscount)}</span></div>` : ''}
    <div class="totals-row"><span>${order.status === 'new' ? 'Delivery Fee' : 'Shipping'}</span><span>${order.status === 'new' ? 'Pending' : fmt(order.shippingCost)}</span></div>
    <hr class="totals-divider"/>
    <div class="totals-total"><span>Total</span><span>${fmt(order.total)}</span></div>
    <p class="totals-payment">${order.isPaid ? '✓ Payment received' : 'Payment due on delivery'}</p>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Ishtile — ishtile.com</span>
    <span>Printed ${printDate}</span>
  </div>

  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
