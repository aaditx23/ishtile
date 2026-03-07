import type { Metadata } from 'next';
import AdminNewProductView from '@/presentation/admin/AdminNewProductView';

export const metadata: Metadata = { title: 'New Product — Admin' };

export default function AdminNewProductPage() {
  return <AdminNewProductView />;
}
