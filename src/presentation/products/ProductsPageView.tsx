import { Suspense } from 'react';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import ProductFilters from './components/ProductFilters';
import MobileProductFilters from './components/MobileProductFilters';
import ProductGrid from '@/presentation/home/components/ProductGrid';
import Pagination from '@/presentation/shared/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';
import type { ProductCardData } from '@/presentation/home/components/ProductCard';

interface ProductsPageViewProps {
  products: ProductCardData[];
  categories: Category[];
  brands: Brand[];
  pagination?: PaginationMeta | null;
  currentPage: number;
}

function SidebarLoading() {
  return (
    <aside style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.25rem' }}>
      {[140, 100, 120, 80, 90].map((w, i) => (
        <Skeleton key={i} style={{ height: '1.25rem', width: `${w}px` }} />
      ))}
    </aside>
  );
}

const EMPTY_STATE = (
  <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.9rem' }}>
    No products found. Try adjusting your filters.
  </div>
);

export default function ProductsPageView({ products, categories, brands, pagination }: ProductsPageViewProps) {
  const total = pagination?.total ?? 0;

  return (
    <ShopLayout>
      <div style={{ paddingTop: '80px' }}>

        {/* ══ MOBILE layout (hidden on lg+) ═══════════════════════════════ */}
        <div className="block lg:hidden" style={{ paddingBottom: '2rem' }}>
          <Suspense fallback={<MobileFiltersSkeleton />}>
            <MobileProductFilters categories={categories} brands={brands} total={total} />
          </Suspense>

          <div style={{ padding: '1rem 1rem 0' }}>
            {products.length === 0 ? EMPTY_STATE : <ProductGrid items={products} stacked />}
            <Suspense fallback={null}>
              {pagination && <Pagination pagination={pagination} />}
            </Suspense>
          </div>
        </div>

        {/* ══ DESKTOP layout (hidden below lg) ════════════════════════════ */}
        <div className="hidden lg:block">
          {/* Page header */}
          <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Products
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginTop: '0.2rem' }}>
              {total} {total === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'flex', gap: '2rem', padding: '2rem 2rem 0', alignItems: 'flex-start' }}>
            <Suspense fallback={<SidebarLoading />}>
              <ProductFilters categories={categories} brands={brands} />
            </Suspense>

            <div style={{ flex: 1, minWidth: 0 }}>
              {products.length === 0 ? EMPTY_STATE : <ProductGrid items={products} stacked />}
              <Suspense fallback={null}>
                {pagination && <Pagination pagination={pagination} />}
              </Suspense>
            </div>
          </div>
        </div>

      </div>
    </ShopLayout>
  );
}

function MobileFiltersSkeleton() {
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton style={{ width: '7rem', height: '1.4rem' }} />
        <Skeleton style={{ width: '3rem', height: '1rem' }} />
      </div>
      <Skeleton style={{ width: '100%', height: '2.25rem' }} />
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        {[60, 80, 70, 90, 65].map((w, i) => (
          <Skeleton key={i} style={{ width: `${w}px`, height: '1.8rem', flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

