import type { Metadata } from 'next';
import { getOrders } from '@/application/order/getOrders';
import OrderHistoryView from '@/presentation/buyer/OrderHistoryView';

export const metadata: Metadata = { title: 'My Orders — Ishtile' };

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function BuyerOrdersPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { items: orders, pagination } = await getOrders({ page, pageSize: 10 });

  return <OrderHistoryView orders={orders} pagination={pagination} />;
}
