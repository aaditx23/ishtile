import Link from 'next/link';
import AdminLayout from './AdminLayout';
import OrderSummaryCard from '@/presentation/orders/components/OrderSummaryCard';
import OrderStatusSelector from './components/OrderStatusSelector';
import { Button } from '@/components/ui/button';
import type { Order } from '@/domain/order/order.entity';

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  borderRadius:    '0.75rem',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '1rem',
};

interface AdminOrderDetailViewProps {
  order: Order;
}

export default function AdminOrderDetailView({ order }: AdminOrderDetailViewProps) {
  return (
    <AdminLayout activeHref="/admin/orders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
            <Link href="/admin/orders">← Orders</Link>
          </Button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Order #{order.orderNumber}
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left: order details */}
          <OrderSummaryCard order={order} />

          {/* Right: admin actions */}
          <div style={sectionStyle}>
            <p style={headingStyle}>Update Status</p>
            <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
