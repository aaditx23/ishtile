import Link from 'next/link';
import BuyerLayout from './BuyerLayout';
import OrderSummaryCard from '@/presentation/orders/components/OrderSummaryCard';
import { Button } from '@/components/ui/button';
import type { Order } from '@/domain/order/order.entity';

interface OrderDetailViewProps {
  order: Order;
}

export default function OrderDetailView({ order }: OrderDetailViewProps) {
  return (
    <BuyerLayout activeHref="/buyer/orders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
            <Link href="/buyer/orders">← Orders</Link>
          </Button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order #{order.orderNumber}</h1>
        </div>
        <OrderSummaryCard order={order} />
      </div>
    </BuyerLayout>
  );
}
