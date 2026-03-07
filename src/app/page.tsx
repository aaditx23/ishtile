import HomePage from '@/presentation/home/HomePage';
import { getProducts } from '@/application/product/getProducts';
import { getCategories } from '@/application/category/getCategories';
import { toProductCardData } from '@/presentation/home/utils/productCard.utils';

// Revalidate every 5 minutes — featured products change infrequently
export const revalidate = 300;

export default async function Page() {
  let products:   Awaited<ReturnType<typeof getProducts>>['items']   = [];
  let categories: Awaited<ReturnType<typeof getCategories>>          = [];

  try {
    [{ items: products }, categories] = await Promise.all([
      getProducts({ isFeatured: true, activeOnly: true, pageSize: 20 }),
      getCategories({ activeOnly: true, includeSubcategories: true }),
    ]);
  } catch {
    // Backend unreachable (cold start, network error) — render empty shell;
    // ISR will retry on the next request interval.
  }

  const cardProducts = products.map((p) => toProductCardData(p, categories));

  return <HomePage products={cardProducts} categories={categories} />;
}
