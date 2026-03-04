import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOrder } from '@/application/order/getOrder';
import OrderDetailView from '@/presentation/buyer/OrderDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id} — Ishtile` };
}

export default async function BuyerOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  return <OrderDetailView order={order} />;
}
