import type { Order } from '@/domain/order/order.entity';
import OrderStatusBadge from './OrderStatusBadge';
import OrderItemList from './OrderItemList';

interface OrderSummaryCardProps {
  order: Order;
}

const fmt = (n: number) => `৳${n.toFixed(0)}`;

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
      <span style={{ color: 'var(--on-surface-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  borderRadius:    '0.75rem',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
  display:         'flex',
  flexDirection:   'column',
  gap:             '1rem',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
};

export default function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>Order #{order.orderNumber}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{orderDate}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items */}
      {order.items && order.items.length > 0 && (
        <div style={sectionStyle}>
          <p style={headingStyle}>Items</p>
          <OrderItemList items={order.items} />
        </div>
      )}

      {/* Totals */}
      <div style={sectionStyle}>
        <p style={headingStyle}>Price Summary</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Row label="Subtotal" value={fmt(order.subtotal)} />
          {order.promoDiscount > 0 && (
            <Row
              label="Promo discount"
              value={<span style={{ color: 'var(--brand-gold)' }}>− {fmt(order.promoDiscount)}</span>}
            />
          )}
          <Row label="Shipping" value={order.shippingCost > 0 ? fmt(order.shippingCost) : 'Free'} />
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          <Row label={<strong>Total</strong>} value={<strong>{fmt(order.total)}</strong>} />
          <Row label="Payment" value={order.isPaid ? '✓ Paid' : 'Cash on Delivery'} />
        </div>
      </div>

      {/* Shipping address */}
      <div style={sectionStyle}>
        <p style={headingStyle}>Shipping Address</p>
        <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600 }}>{order.shippingName}</p>
          <p style={{ color: 'var(--on-surface-muted)' }}>{order.shippingPhone}</p>
          <p>{order.shippingAddress}</p>
          <p>{order.shippingCity}{order.shippingPostalCode ? ` — ${order.shippingPostalCode}` : ''}</p>
          {order.customerNotes && (
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: 'var(--on-surface-muted)' }}>
              Note: {order.customerNotes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
