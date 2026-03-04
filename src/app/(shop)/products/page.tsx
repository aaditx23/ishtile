import ProductsPageView from '@/presentation/products/ProductsPageView';
import { getProducts } from '@/application/product/getProducts';
import { getCategories } from '@/application/category/getCategories';
import { toProductCardData } from '@/presentation/home/utils/productCard.utils';

export const revalidate = 60;

interface SearchParams {
  category?: string;
  sub?: string;
  search?: string;
  page?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Number(params.page ?? '1');

  // Fetch categories first so we can resolve slug → ID
  const categories = await getCategories({ activeOnly: true, includeSubcategories: true });

  const matchedCategory = params.category
    ? categories.find((c) => c.slug === params.category)
    : undefined;

  const { items, pagination } = await getProducts({
    page,
    pageSize:   24,
    categoryId: matchedCategory?.id,
    search:     params.search,
    activeOnly: true,
  });

  const cardProducts = items.map((p) => toProductCardData(p, categories));

  return (
    <ProductsPageView
      products={cardProducts}
      categories={categories}
      pagination={pagination}
      currentPage={page}
    />
  );
}
