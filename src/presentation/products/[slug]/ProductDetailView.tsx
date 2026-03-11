import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import ProductImages from './components/ProductImages';
import ProductMeta from './components/ProductMeta';
import ProductDetailInteractive from './components/ProductDetailInteractive';
import FavouriteButton from './components/FavouriteButton';
import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';

interface ProductDetailViewProps {
  product: Product;
  categories: Category[];
  brands: Brand[];
}

export default function ProductDetailView({ product, categories, brands }: ProductDetailViewProps) {
  const category = categories.find((c) => c.id === product.categoryId);
  const brand = brands.find((b) => b.id === product.brandId);

  return (
    <ShopLayout>
      <div style={{ paddingTop: '80px' }}>
        {/* Breadcrumb */}
        <nav style={{ padding: '1rem 3rem', fontSize: '0.8rem', color: 'var(--on-surface-muted)', display: 'flex', gap: '0.5rem' }}>
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">Products</Link>
          {category && (
            <>
              <span>/</span>
              <Link href={`/products?category=${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: 'var(--on-surface)' }}>{product.name}</span>
        </nav>

        {/* Two-column layout: image | info */}
        <div
          style={{
            display:  'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap:      '2.5rem',
            padding:  '0 3rem 4rem',
            maxWidth: '1200px',
            margin:   '0 auto',
          }}
        >
          {/* Left — images */}
          <ProductImages images={product.imageUrls} productName={product.name} />

          {/* Right — meta + controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header row: meta + favourite button */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <ProductMeta product={product} categoryName={category?.name} brandName={brand?.name} hidePrice={!!product.variants?.length} />
              </div>
              <FavouriteButton productId={product.id} />
            </div>

            {/* Variant picker + add to cart */}
            <ProductDetailInteractive product={product} />
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
