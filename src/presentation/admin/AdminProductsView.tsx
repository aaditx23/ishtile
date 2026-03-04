import Link from 'next/link';
import { Suspense } from 'react';
import AdminLayout from './AdminLayout';
import Pagination from '@/presentation/shared/components/Pagination';
import type { Product } from '@/domain/product/product.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';
import AdminProductsActions from './components/AdminProductsActions';

interface AdminProductsViewProps {
  products:   Product[];
  pagination: PaginationMeta;
}

export default function AdminProductsView({ products, pagination }: AdminProductsViewProps) {
  return (
    <AdminLayout activeHref="/admin/products">
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
              backgroundColor: 'var(--brand-dark)',
              color:           'var(--on-primary)',
              textDecoration:  'none',
              fontSize:        '0.8rem',
              fontWeight:      700,
            }}
          >
            + New Product
          </Link>
        </div>

        <div
          style={{
            border:          '1px solid var(--border)',
            borderRadius:    '0.75rem',
            overflow:        'hidden',
            backgroundColor: 'var(--surface)',
          }}
        >
          {products.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
              No products yet.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                  {['Product', 'SKU', 'Price', 'Status', ''].map((h) => (
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
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                      ৳{product.basePrice.toFixed(0)}
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
                        <AdminProductsActions productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <Suspense><Pagination pagination={pagination} /></Suspense>
        )}
      </div>
    </AdminLayout>
  );
}
