import type { Metadata } from 'next';
import { getCategories } from '@/application/category/getCategories';
import AdminNewProductView from '@/presentation/admin/AdminNewProductView';

export const metadata: Metadata = { title: 'New Product — Admin' };

export default async function AdminNewProductPage() {
  const categories = await getCategories({ activeOnly: true });
  return <AdminNewProductView categories={categories} />;
}
