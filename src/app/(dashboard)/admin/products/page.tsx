import type { Metadata } from 'next';
import { getProducts } from '@/application/product/getProducts';
import AdminProductsView from '@/presentation/admin/AdminProductsView';

export const metadata: Metadata = { title: 'Products — Admin' };

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const { page: pageStr, search } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const { items: products, pagination } = await getProducts({ page, pageSize: 25, search });

  return <AdminProductsView products={products} pagination={pagination} />;
}
