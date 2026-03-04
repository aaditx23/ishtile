import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOrder } from '@/application/order/getOrder';
import AdminOrderDetailView from '@/presentation/admin/AdminOrderDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id} — Admin` };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  return <AdminOrderDetailView order={order} />;
}
