'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from './AdminLayout';
import VariantManager from './components/VariantManager';
import ProductForm from './components/ProductForm';
import { Button } from '@/components/ui/button';
import { getProductById } from '@/application/product/adminProduct';
import { getCategories } from '@/application/category/getCategories';
import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  borderRadius:    '0.75rem',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '1rem',
};

export default function AdminProductEditView() {
  const params                        = useParams<{ id: string }>();
  const [product, setProduct]         = useState<Product | null>(null);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);

  useEffect(() => {
    const productId = Number(params.id);
    if (isNaN(productId)) { setNotFound(true); setLoading(false); return; }
    Promise.all([getProductById(productId), getCategories({ activeOnly: true })])
      .then(([p, cats]) => {
        if (!p) { setNotFound(true); }
        else { setProduct(p); setCategories(cats); }
      })
      .catch(() => toast.error('Failed to load product.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <AdminLayout activeHref="/admin/products">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
            <Link href="/admin/products">← Products</Link>
          </Button>
          {product && <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.name}</h1>}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Skeleton style={{ height: '20rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '12rem', borderRadius: '0.75rem' }} />
          </div>
        )}
        {notFound && !loading && <p style={{ color: 'var(--on-surface-muted)' }}>Product not found.</p>}
        {product && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={sectionStyle}>
              <p style={headingStyle}>Product Details</p>
              <ProductForm product={product} categories={categories} />
            </div>
            <div style={sectionStyle}>
              <p style={headingStyle}>Variants &amp; Inventory</p>
              <VariantManager productId={product.id} initialVariants={product.variants ?? []} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
