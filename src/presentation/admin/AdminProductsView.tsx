'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminProductsView from './MobileAdminProductsView';
import Pagination from '@/presentation/shared/components/Pagination';
import AdminProductsActions from './components/AdminProductsActions';
import { getProducts } from '@/application/product/getProducts';
import { getBrands } from '@/application/brand/getBrands';
import type { Product } from '@/domain/product/product.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

export default function AdminProductsView() {
  const searchParams                  = useSearchParams();
  const router                        = useRouter();
  const page                          = Math.max(1, Number(searchParams.get('page')) || 1);
  const search                        = searchParams.get('search') ?? undefined;
  const [products, setProducts]       = useState<Product[]>([]);
  const [brands, setBrands]           = useState<Brand[]>([]);
  const [pagination, setPagination]   = useState<PaginationMeta | null>(null);
  const [loading, setLoading]         = useState(true);
  const [searchInput, setSearchInput] = useState(search ?? '');
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getBrandName = (brandId: number | null) => {
    if (!brandId) return '—';
    const brand = brands.find(b => b.id === brandId);
    return brand?.name ?? '—';
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set('search', value.trim());
      router.push(`/admin/products${params.size ? '?' + params.toString() : ''}`);
    }, 350);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProducts({ page, pageSize: 25, search }),
      getBrands({ activeOnly: false, pageSize: 500 }),
    ])
      .then(([{ items, pagination: pg }, brandList]) => {
        setProducts(items);
        setPagination(pg);
        setBrands(brandList);
      })
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminProductsView
          products={products}
          brands={brands}
          loading={loading}
          pagination={pagination}
          searchInput={searchInput}
          onSearch={handleSearch}
          onDeleted={(id) => setProducts((prev) => prev.filter((p) => p.id !== id))}
        />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:grid"
        style={{
          maxWidth:            '84rem',
          margin:              '0 auto',
          padding:             '2rem 1.25rem',
          gridTemplateColumns: '13rem 1fr',
          gap:                 '2rem',
          alignItems:          'start',
        }}
      >
        <AdminSidebarNav activeHref="/admin/products" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Products</h1>
              <Link
                href="/admin/products/new"
                style={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  gap:             '0.375rem',
                  padding:         '0.5rem 1rem',
                  borderRadius:    '0.5rem',
                  backgroundColor: 'var(--primary)',
                  color:           'var(--on-primary)',
                  textDecoration:  'none',
                  fontSize:        '0.8rem',
                  fontWeight:      700,
                }}
              >
                + New Product
              </Link>
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', maxWidth: '22rem' }}>
              <svg
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '0.9rem', height: '0.9rem', color: 'var(--on-surface-muted)', pointerEvents: 'none' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products…"
                style={{
                  width:           '100%',
                  paddingLeft:     '2.25rem',
                  paddingRight:    searchInput ? '2rem' : '0.75rem',
                  paddingTop:      '0.45rem',
                  paddingBottom:   '0.45rem',
                  border:          '1px solid var(--border)',
                  borderRadius:    '0.5rem',
                  backgroundColor: 'var(--surface)',
                  color:           'var(--on-surface)',
                  fontSize:        '0.8rem',
                  outline:         'none',
                }}
              />
              {searchInput && (
                <button
                  onClick={() => handleSearch('')}
                  style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', fontSize: '1rem', lineHeight: 1, padding: 0 }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '3.25rem', borderRadius: '0.5rem' }} />)}
              </div>
            ) : (
              <div
                style={{
                  border:          '1px solid var(--border)',
                  borderRadius:    '0.75rem',
                  overflowX:       'auto',
                  overflowY:       'visible',
                  backgroundColor: 'var(--surface)',
                }}
              >
                {products.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                    No products yet.
                  </p>
                ) : (
                  <table style={{ width: '100%', minWidth: '42rem', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                        {['Product', 'SKU', 'Brand', 'Price', 'Status', ''].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding:       '0.6rem 1rem',
                              textAlign:     'left',
                              fontWeight:    600,
                              fontSize:      '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color:         'var(--on-surface-muted)',
                              whiteSpace:    'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, i) => (
                        <tr
                          key={product.id}
                          style={{ borderBottom: i < products.length - 1 ? '1px solid var(--border)' : 'none' }}
                        >
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem' }}>{product.name}</p>
                            <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.7rem' }}>{product.slug}</p>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {product.sku}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
                            {getBrandName(product.brandId)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                            ৳{Number(product.basePrice || 0).toFixed(0)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span
                              style={{
                                fontSize:        '0.7rem',
                                fontWeight:      700,
                                textTransform:   'uppercase',
                                letterSpacing:   '0.05em',
                                padding:         '0.2rem 0.5rem',
                                borderRadius:    '9999px',
                                backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2',
                                color:           product.isActive ? '#065f46' : '#991b1b',
                              }}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <Link
                                href={`/admin/products/${product.id}`}
                                style={{ fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', color: 'var(--brand-gold)' }}
                              >
                                Edit →
                              </Link>
                              <AdminProductsActions
                                productId={product.id}
                                productName={product.name}
                                onDeleted={() => setProducts((prev) => prev.filter((p) => p.id !== product.id))}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <Suspense><Pagination pagination={pagination} /></Suspense>
            )}
          </div>
        </main>
      </div>
    </ShopLayout>
  );
}
