import HomePage from '@/presentation/home/HomePage';
import { getProducts } from '@/application/product/getProducts';
import { getCategories } from '@/application/category/getCategories';
import { getBrands } from '@/application/brand/getBrands';
import { getActiveHeroImages } from '@/application/home/getActiveHeroImages';
import { toProductCardData } from '@/presentation/home/utils/productCard.utils';

// Revalidate every 5 minutes — featured products change infrequently
export const revalidate = 300;

export default async function Page() {
  let products:   Awaited<ReturnType<typeof getProducts>>['items']   = [];
  let trending:   Awaited<ReturnType<typeof getProducts>>['items']   = [];
  let categories: Awaited<ReturnType<typeof getCategories>>          = [];
  let brands:     Awaited<ReturnType<typeof getBrands>>              = [];
  let heroImages: Awaited<ReturnType<typeof getActiveHeroImages>>    = [];

  try {
    [{ items: products }, { items: trending }, categories, brands, heroImages] = await Promise.all([
      getProducts({ isFeatured: true, activeOnly: true, pageSize: 20 }),
      getProducts({ isTrending: true, activeOnly: true, pageSize: 20 }),
      getCategories({ activeOnly: true, includeSubcategories: true }),
      getBrands({ activeOnly: true }),
      getActiveHeroImages(),
    ]);
  } catch {
    // Backend unreachable (cold start, network error) — render empty shell;
    // ISR will retry on the next request interval.
  }

  const cardProducts = products.map((p) => toProductCardData(p, categories));
  const trendingCardProducts = trending.map((p) => toProductCardData(p, categories));

  return <HomePage products={cardProducts} trendingProducts={trendingCardProducts} categories={categories} brands={brands} heroImages={heroImages} />;
}
