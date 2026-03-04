import type { Metadata } from 'next';
import AdminPromosView from '@/presentation/admin/AdminPromosView';

export const metadata: Metadata = { title: 'Promos — Admin' };

export default function AdminPromosPage() {
  return <AdminPromosView />;
}
