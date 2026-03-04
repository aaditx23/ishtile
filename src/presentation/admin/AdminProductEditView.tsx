import Link from 'next/link';
import AdminLayout from './AdminLayout';
import VariantManager from './components/VariantManager';
import ProductForm from './components/ProductForm';
import { Button } from '@/components/ui/button';
import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';

interface AdminProductEditViewProps {
  product:    Product;
  categories: Category[];
}

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

export default function AdminProductEditView({ product, categories }: AdminProductEditViewProps) {
  return (
    <AdminLayout activeHref="/admin/products">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
            <Link href="/admin/products">← Products</Link>
          </Button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{product.name}</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Product details form */}
          <div style={sectionStyle}>
            <p style={headingStyle}>Product Details</p>
            <ProductForm product={product} categories={categories} />
          </div>

          {/* Variants */}
          <div style={sectionStyle}>
            <p style={headingStyle}>Variants &amp; Inventory</p>
            <VariantManager productId={product.id} initialVariants={product.variants ?? []} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
