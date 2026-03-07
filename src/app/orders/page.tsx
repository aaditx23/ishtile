import type { Metadata } from 'next';
import { Suspense } from 'react';
import OrderHistoryView from '@/presentation/user/OrderHistoryView';

export const metadata: Metadata = { title: 'My Orders — Ishtile' };

export default function OrdersPage() {
  return <Suspense><OrderHistoryView /></Suspense>;
}
