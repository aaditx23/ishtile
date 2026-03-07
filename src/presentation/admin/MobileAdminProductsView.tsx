'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import Pagination from '@/presentation/shared/components/Pagination';
import AdminProductsActions from './components/AdminProductsActions';
import type { Product } from '@/domain/product/product.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

interface MobileAdminProductsViewProps {
  products:       Product[];
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
  borderRadius:    '0.5rem',
  backgroundColor: 'var(--primary)',
  color:           'var(--on-primary)',
  textDecoration:  'none',
  fontSize:        '0.8rem',
  fontWeight:      700,
};

export default function MobileAdminProductsView({
  products,
  loading,
  pagination,
  searchInput,
  onSearch,
  onDeleted,
}: MobileAdminProductsViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>
      <AdminMobileNavStrip activeHref="/admin/products" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Products</h1>
        <Link href="/admin/products/new" style={newProductBtn}>+ New</Link>
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
            borderRadius:    '0.5rem',
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
          {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '4.5rem', borderRadius: '0.625rem' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '0.75rem', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
          No products found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border:          '1px solid var(--border)',
                borderRadius:    '0.625rem',
                padding:         '0.7rem 1rem',
                backgroundColor: 'var(--surface)',
              }}
            >
              {/* Row 1: name + actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <p style={{ flex: 1, minWidth: 0, fontWeight: 600, fontSize: '0.825rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </p>
                <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', flexShrink: 0 }}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    style={{ fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', color: '#A58C69' }}
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

              {/* Row 2: sku + price + badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <p style={{ flex: 1, minWidth: 0, color: 'var(--on-surface-muted)', fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.sku}
                </p>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                  ৳{Number(product.basePrice || 0).toFixed(0)}
                </span>
                <span
                  style={{
                    fontSize:        '0.6rem',
                    fontWeight:      700,
                    textTransform:   'uppercase',
                    padding:         '0.15rem 0.4rem',
                    borderRadius:    '9999px',
                    backgroundColor: product.isActive ? '#d1fae5' : '#fee2e2',
                    color:           product.isActive ? '#065f46' : '#991b1b',
                    flexShrink:      0,
                  }}
                >
                  {product.isActive ? 'Active' : 'Off'}
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
