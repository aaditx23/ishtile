import type { OrderStatus } from '@/domain/order/order.entity';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  new:       { label: 'New',       bg: '#fef3c7', color: '#b45309' },
  confirmed: { label: 'Confirmed', bg: '#d1fae5', color: '#065f46' },
  shipped:   { label: 'Shipped',   bg: '#e0e7ff', color: '#3730a3' },
  delivered: { label: 'Delivered', bg: '#d1fae5', color: '#065f46' },
  cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#991b1b' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?:  'sm' | 'md' | 'lg';
}

export default function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: 'var(--surface-muted)', color: 'var(--on-surface)' };
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '0.9rem' : '0.75rem';
  return (
    <span
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        borderRadius:  '9999px',
        padding:       size === 'sm' ? '0.15rem 0.6rem' : '0.25rem 0.75rem',
        fontSize,
        fontWeight:    700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        backgroundColor: cfg.bg,
        color:           cfg.color,
      }}
    >
      {cfg.label}
    </span>
  );
}
