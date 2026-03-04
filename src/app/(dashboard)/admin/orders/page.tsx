import type { Metadata } from 'next';
import { getOrders } from '@/application/order/getOrders';
import AdminOrdersView from '@/presentation/admin/AdminOrdersView';
import type { OrderStatus } from '@/shared/types/api.types';

export const metadata: Metadata = { title: 'Orders — Admin' };

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const { page: pageStr, status } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { items: orders, pagination } = await getOrders({
    page,
    pageSize: 20,
    status:   status as OrderStatus | undefined,
  });

  return <AdminOrdersView orders={orders} pagination={pagination} />;
}
