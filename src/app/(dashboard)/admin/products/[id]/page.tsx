import type { Metadata } from 'next';
import AdminProductEditView from '@/presentation/admin/AdminProductEditView';

export const metadata: Metadata = { title: 'Edit Product — Admin' };

export default function AdminProductEditPage() {
  return <AdminProductEditView />;
}
