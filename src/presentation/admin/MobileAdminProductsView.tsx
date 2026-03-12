'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import Pagination from '@/presentation/shared/components/Pagination';
import AdminProductsActions from './components/AdminProductsActions';
import type { Product } from '@/domain/product/product.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

interface MobileAdminProductsViewProps {
  products:       Product[];
  brands:         Brand[];
  loading:        boolean;
  pagination:     PaginationMeta | null;
  searchInput:    string;
  onSearch:       (v: string) => void;
  onDeleted:      (id: number) => void;
}

const newProductBtn: React.CSSProperties = {
  display:         'inline-flex',
  alignItems:      'center',
  padding:         '0.4rem 0.9rem',
  backgroundColor: 'var(--primary)',
  color:           'var(--on-primary)',
  textDecoration:  'none',
  fontSize:        '0.8rem',
  fontWeight:      700,
};

export default function MobileAdminProductsView({
  products,
  brands,
  loading,
  pagination,
  searchInput,
  onSearch,
  onDeleted,
}: MobileAdminProductsViewProps) {
  const getBrandName = (brandId: number | null) => {
    if (!brandId) return null;
    const brand = brands.find(b => b.id === brandId);
    return brand?.name ?? null;
  };

  return (
    <div style={{ padding: '1.25rem 1rem' }}>
      <AdminMobileNavStrip activeHref="/admin/products" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Products</h1>
        <Link href="/admin/products/new" style={{ ...newProductBtn, whiteSpace: 'nowrap' }}>+ New</Link>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
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
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            width:           '100%',
            paddingLeft:     '2.25rem',
            paddingRight:    searchInput ? '2rem' : '0.75rem',
            paddingTop:      '0.45rem',
            paddingBottom:   '0.45rem',
            border:          '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color:           'var(--on-surface)',
            fontSize:        '0.8rem',
            outline:         'none',
          }}
        />
        {searchInput && (
          <button
            onClick={() => onSearch('')}
            style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', fontSize: '1rem', lineHeight: 1, padding: 0 }}
            aria-label="Clear search"
          >×</button>
        )}
      </div>

      {/* Product cards */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '5rem' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
          No products found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border:          '1px solid var(--border)',
                padding:         '0.75rem 1rem',
                backgroundColor: 'var(--surface)',
              }}
            >
              {/* Row 1: Image + Name + Status + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <div style={{ width: '2.5rem', height: '2.5rem', overflow: 'hidden', flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrls[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'var(--surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--on-surface-muted)', flexShrink: 0 }}>
                    —
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                  </h3>
                  <span
                    style={{
                      fontSize:        '0.6rem',
                      fontWeight:      700,
                      textTransform:   'uppercase',
                      padding:         '0.15rem 0.4rem',
                      backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2',
                      color:           product.isActive ? '#065f46' : '#991b1b',
                      flexShrink:      0,
                    }}
                  >
                    {product.isActive ? 'Active' : 'Off'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    style={{ fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', color: 'var(--brand-gold)' }}
                  >
                    Edit
                  </Link>
                  <AdminProductsActions
                    productId={product.id}
                    productName={product.name}
                    onDeleted={() => onDeleted(product.id)}
                  />
                </div>
              </div>

              {/* Row 2: Brand + SKU + Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
                {getBrandName(product.brandId) && (
                  <>
                    <span>{getBrandName(product.brandId)}</span>
                    <span>•</span>
                  </>
                )}
                <span style={{ flex: 1, minWidth: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {product.sku}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--on-surface)', flexShrink: 0 }}>
                  ৳{Number(product.basePrice || 0).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ marginTop: '1rem' }}>
          <Suspense><Pagination pagination={pagination} /></Suspense>
        </div>
      )}
    </div>
  );
}
