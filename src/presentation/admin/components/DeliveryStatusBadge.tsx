'use client';

import type { ShipmentStatus } from '@/domain/order/order.entity';

interface DeliveryStatusBadgeProps {
  status: ShipmentStatus;
  size?:  'sm' | 'md';
}

const STATUS_CONFIG: Record<ShipmentStatus, { label: string; bg: string; color: string }> = {
  pending:    { label: 'Pending',    bg: '#f3f4f6', color: '#6b7280' },
  created:    { label: 'Booked',     bg: '#dbeafe', color: '#1d4ed8' },
  picked_up:  { label: 'Picked Up',  bg: '#ede9fe', color: '#7c3aed' },
  in_transit: { label: 'In Transit', bg: '#fef3c7', color: '#b45309' },
  delivered:  { label: 'Delivered',  bg: '#dcfce7', color: '#15803d' },
  returned:   { label: 'Returned',   bg: '#ffedd5', color: '#c2410c' },
  cancelled:  { label: 'Cancelled',  bg: '#fee2e2', color: '#b91c1c' },
};

export default function DeliveryStatusBadge({ status, size = 'md' }: DeliveryStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;

  return (
    <span
      style={{
        display:         'inline-block',
        padding:         size === 'sm' ? '0.2rem 0.55rem' : '0.3rem 0.75rem',
        borderRadius:    '9999px',
        fontSize:        size === 'sm' ? '0.7rem' : '0.78rem',
        fontWeight:      600,
        backgroundColor: cfg.bg,
        color:           cfg.color,
        whiteSpace:      'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
