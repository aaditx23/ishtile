import type { Metadata } from 'next';
import AdminOrderDetailView from '@/presentation/admin/AdminOrderDetailView';

export const metadata: Metadata = { title: 'Order — Admin' };

export default function AdminOrderDetailPage() {
  return <AdminOrderDetailView />;
}
