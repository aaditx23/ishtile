import { Suspense } from 'react';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import ProductFilters from './components/ProductFilters';
import ProductGrid from '@/presentation/home/components/ProductGrid';
import Pagination from '@/presentation/shared/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/domain/category/category.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';
import type { ProductCardData } from '@/presentation/home/components/ProductCard';

interface ProductsPageViewProps {
  products: ProductCardData[];
  categories: Category[];
  pagination: PaginationMeta;
  currentPage: number;
}

function FiltersLoading() {
  return (
    <div style={{ padding: '1.5rem 3rem', display: 'flex', gap: '0.5rem' }}>
      {[120, 80, 90, 70, 100].map((w, i) => (
        <Skeleton key={i} style={{ height: '2rem', width: `${w}px`, borderRadius: '9999px' }} />
      ))}
    </div>
  );
}

/**
 * Server component that composes the full products listing page.
 * ProductFilters is wrapped in Suspense because it uses useSearchParams.
 */
export default function ProductsPageView({ products, categories, pagination, currentPage }: ProductsPageViewProps) {
  return (
    <ShopLayout>
      <div style={{ paddingTop: '80px' }}> {/* offset for fixed header */}

        <div style={{ padding: '2rem 3rem 0' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            All Products
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', marginTop: '0.25rem' }}>
            {pagination.total} items
          </p>
        </div>

        <Suspense fallback={<FiltersLoading />}>
          <ProductFilters categories={categories} />
        </Suspense>

        <ProductGrid items={products} />

        <Suspense fallback={null}>
          <Pagination pagination={pagination} />
        </Suspense>
      </div>
    </ShopLayout>
  );
}
