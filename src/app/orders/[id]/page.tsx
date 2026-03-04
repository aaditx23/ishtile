import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getOrder } from '@/application/order/getOrder';
import OrderConfirmationView from '@/presentation/orders/OrderConfirmationView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order #${id} — Ishtyle` };
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  return <OrderConfirmationView order={order} />;
}
