import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProductById } from '@/application/product/adminProduct';
import { getCategories } from '@/application/category/getCategories';
import AdminProductEditView from '@/presentation/admin/AdminProductEditView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit Product #${id} — Admin` };
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);
  if (isNaN(productId)) notFound();

  const [product, categories] = await Promise.all([
    getProductById(productId),
    getCategories({ activeOnly: true }),
  ]);
  if (!product) notFound();

  return <AdminProductEditView product={product} categories={categories} />;
}
