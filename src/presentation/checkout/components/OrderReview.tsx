import type { Cart } from '@/domain/cart/cart.entity';

interface OrderReviewProps {
  cart:            Cart;
  promoDiscount?:  number;
  shippingCost?:   number;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function OrderReview({ cart, promoDiscount = 0, shippingCost = 0 }: OrderReviewProps) {
  const total = cart.subtotal - promoDiscount + shippingCost;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Item list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {cart.items.map((item) => (
          <div
            key={item.id}
            style={{
              display:     'grid',
              gridTemplate: 'auto / auto 1fr auto',
              gap:         '0.75rem',
              alignItems:  'center',
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                width:           '3rem',
                height:          '3rem',
                overflow:        'hidden',
                flexShrink:      0,
                backgroundColor: 'var(--surface-muted)',
              }}
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%' }} />
              )}
            </div>

            {/* Name + variant */}
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{item.productName}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '0.1rem' }}>
                {[item.variantSize, item.variantColor].filter(Boolean).join(' / ')} × {item.quantity}
              </p>
            </div>

            {/* Line total */}
            <p style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {fmt(item.lineTotal)}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

      {/* Totals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
        <Row label={`Subtotal (${cart.totalItems} item${cart.totalItems !== 1 ? 's' : ''})`} value={fmt(cart.subtotal)} />
        {promoDiscount > 0 && <Row label="Promo discount" value={`− ${fmt(promoDiscount)}`} highlight />}
        <Row label="Shipping" value={shippingCost > 0 ? fmt(shippingCost) : 'Free'} />
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
        <Row label="Total" value={fmt(total)} bold />
      </div>
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: highlight ? 'var(--brand-gold)' : undefined, fontWeight: bold ? 700 : undefined }}>{label}</span>
      <span style={{ color: highlight ? 'var(--brand-gold)' : undefined, fontWeight: bold ? 700 : undefined }}>{value}</span>
    </div>
  );
}
