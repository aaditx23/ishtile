import HomePage from '@/presentation/home/HomePage';
import { getProducts } from '@/application/product/getProducts';
import { getCategories } from '@/application/category/getCategories';
import { toProductCardData } from '@/presentation/home/utils/productCard.utils';

// Revalidate every 5 minutes — featured products change infrequently
export const revalidate = 300;

export default async function Page() {
  // Fetch featured products and all active categories in parallel
  const [{ items: products }, categories] = await Promise.all([
    getProducts({ isFeatured: true, activeOnly: true, pageSize: 20 }),
    getCategories({ activeOnly: true, includeSubcategories: true }),
  ]);

  const cardProducts = products.map((p) => toProductCardData(p, categories));

  return <HomePage products={cardProducts} categories={categories} />;
}
