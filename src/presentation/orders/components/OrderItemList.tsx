import type { OrderItem } from '@/domain/order/order.entity';

interface OrderItemListProps {
  items: OrderItem[];
}

const fmt = (n: number) => `৳${n.toFixed(0)}`;

export default function OrderItemList({ items }: OrderItemListProps) {
  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display:     'flex',
            justifyContent: 'space-between',
            alignItems:  'flex-start',
            gap:         '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{item.productName}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '0.15rem' }}>
              {[item.variantSize, item.variantColor].filter(Boolean).join(' / ')}{' '}
              &nbsp;×{' '}{item.quantity}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)', fontFamily: 'monospace' }}>
              {item.variantSku}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{fmt(item.lineTotal)}</p>
            {item.quantity > 1 && (
              <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
                {fmt(item.unitPrice)} each
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
