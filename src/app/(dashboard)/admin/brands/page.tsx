import type { Metadata } from 'next';
import AdminBrandsView from '@/presentation/admin/AdminBrandsView';

export const metadata: Metadata = { title: 'Brands — Admin' };

export default function AdminBrandsPage() {
  return <AdminBrandsView />;
}
