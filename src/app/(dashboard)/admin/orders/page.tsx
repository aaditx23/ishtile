import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminOrdersView from '@/presentation/admin/AdminOrdersView';

export const metadata: Metadata = { title: 'Orders — Admin' };

export default function AdminOrdersPage() {
  return <Suspense><AdminOrdersView /></Suspense>;
}
