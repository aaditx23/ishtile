import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import ProductImagesSharp from './components/ProductImagesSharp';
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
        {/* Two-column 50/50 layout: image | info */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{
            gap:      '0',
            minHeight: 'calc(100vh - 80px)',
          }}
        >
          {/* Left — images (50%) */}
          <ProductImagesSharp images={product.imageUrls} productName={product.name} />

          {/* Right — meta + controls (50%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="p-4 md:p-8">
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
