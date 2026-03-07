import type { Metadata } from 'next';
import OrderDetailView from '@/presentation/user/OrderDetailView';

export const metadata: Metadata = { title: 'Order — Ishtile' };

export default function OrderPage() {
  return <OrderDetailView />;
}
