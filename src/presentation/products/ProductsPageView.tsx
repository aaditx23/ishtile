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
  pagination?: PaginationMeta | null;
  currentPage: number;
}

function SidebarLoading() {
  return (
    <aside style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.25rem' }}>
      {[140, 100, 120, 80, 90].map((w, i) => (
        <Skeleton key={i} style={{ height: '1.25rem', width: `${w}px`, borderRadius: '0.375rem' }} />
      ))}
    </aside>
  );
}

export default function ProductsPageView({ products, categories, pagination }: ProductsPageViewProps) {
  return (
    <ShopLayout>
      <div style={{ paddingTop: '80px' }}>

        {/* ── Page header ─────────────────────────────── */}
        <div style={{ padding: '2rem 2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Products
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginTop: '0.2rem' }}>
            {pagination?.total ?? 0} {(pagination?.total ?? 0) === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* ── Two-column layout ───────────────────────── */}
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem 2rem 0', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <Suspense fallback={<SidebarLoading />}>
            <ProductFilters categories={categories} />
          </Suspense>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {products.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.9rem' }}>
                No products found. Try adjusting your filters.
              </div>
            ) : (
              <ProductGrid items={products} />
            )}

            <Suspense fallback={null}>
              {pagination && <Pagination pagination={pagination} />}
            </Suspense>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
