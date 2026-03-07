import { notFound } from 'next/navigation';
import ProductDetailView from '@/presentation/products/[slug]/ProductDetailView';
import { getProductBySlug } from '@/application/product/getProductBySlug';
import { getCategories } from '@/application/category/getCategories';

interface Params {
  slug: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  let product:    Awaited<ReturnType<typeof getProductBySlug>>  = null;
  let categories: Awaited<ReturnType<typeof getCategories>>     = [];

  try {
    [product, categories] = await Promise.all([
      getProductBySlug(slug),
      getCategories({ activeOnly: true, includeSubcategories: true }),
    ]);
  } catch {
    // Backend unreachable
  }

  if (!product) notFound();

  return <ProductDetailView product={product} categories={categories} />;
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: product ? `${product.name} — Ishtile` : 'Product Not Found',
      description: product?.description ?? undefined,
    };
  } catch {
    return { title: 'Ishtile' };
  }
}
