import type { OrderStatus } from '@/domain/order/order.entity';

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: 'var(--warning-bg)', color: 'var(--on-warning)' },
  confirmed: { label: 'Confirmed', bg: 'var(--success-bg)', color: 'var(--on-success)' },
  shipped:   { label: 'Shipped',   bg: 'var(--info-bg)',    color: 'var(--on-info)' },
  delivered: { label: 'Delivered', bg: 'var(--success-bg)', color: 'var(--on-success)' },
  cancelled: { label: 'Cancelled', bg: 'var(--error-bg)',   color: 'var(--on-error)' },
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
