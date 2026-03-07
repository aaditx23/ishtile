import type { Metadata } from 'next';
import AdminCategoriesView from '@/presentation/admin/AdminCategoriesView';

export const metadata: Metadata = { title: 'Categories — Admin' };

export default function AdminCategoriesPage() {
  return <AdminCategoriesView />;
}
