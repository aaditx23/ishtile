import ProductsPageView from '@/presentation/products/ProductsPageView';
import { getProducts } from '@/application/product/getProducts';
import { getCategories } from '@/application/category/getCategories';
import { getBrands } from '@/application/brand/getBrands';
import { toProductCardData } from '@/presentation/home/utils/productCard.utils';

export const revalidate = 60;

interface SearchParams {
  category?:   string;
  sub?:        string;
  search?:     string;
  brand?:      string;
  featured?:   string; // '1' = true
  trending?:   string; // '1' = true
  activeOnly?: string; // '0' = false (default true)
  page?:       string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page   = Math.max(1, Number(params.page ?? '1'));

  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let brands: Awaited<ReturnType<typeof getBrands>> = [];
  let cardProducts: ReturnType<typeof toProductCardData>[]  = [];
  let pagination = { page: 1, pageSize: 24, total: 0, totalPages: 0, hasNext: false, hasPrev: false };

  try {
    categories = await getCategories({ activeOnly: true, includeSubcategories: true });
    brands = await getBrands({ activeOnly: true });

    const matchedCategory    = params.category ? categories.find((c) => c.slug === params.category) : undefined;
    const matchedSubcategory = (matchedCategory && params.sub)
      ? matchedCategory.subcategories?.find((s) => s.slug === params.sub)
      : undefined;
    const matchedBrand = params.brand ? brands.find((b) => b.slug === params.brand) : undefined;
    const parsedBrandId = params.brand ? Number.parseInt(params.brand, 10) : undefined;
    const fallbackBrandId = parsedBrandId && Number.isFinite(parsedBrandId) ? parsedBrandId : undefined;

    const { items, pagination: pg } = await getProducts({
      page,
      pageSize:      24,
      categoryId:    matchedCategory?.id,
      subcategoryId: matchedSubcategory?.id,
      brandId:       matchedBrand?.id ?? fallbackBrandId,
      search:        params.search       || undefined,
      isFeatured:    params.featured === '1' ? true : undefined,
      isTrending:    params.trending === '1' ? true : undefined,
      activeOnly:    params.activeOnly === '0' ? false : true,
    });

    cardProducts = items.map((p) => toProductCardData(p, categories));
    pagination   = pg;
  } catch {
    // Backend unreachable — render empty shell
  }

  return (
    <ProductsPageView
      products={cardProducts}
      categories={categories}
      brands={brands}
      pagination={pagination}
      currentPage={page}
    />
  );
}
