import type { Metadata } from 'next';
import AdminLookbooksView from '@/presentation/admin/AdminLookbooksView';

export const metadata: Metadata = { title: 'Lookbooks — Admin' };

export default function AdminLookbooksPage() {
  return <AdminLookbooksView />;
}
