'use client';

import { useMemo, useState } from 'react';
import BrandSelector, {
  type BrandFilterValue,
  type BrandSelectorItem,
} from './BrandSelector';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';
import type { ProductCardData } from './ProductCard';
import type { Brand } from '@/domain/brand/brand.entity';

// ── Static backgrounds per brand index (cycles if more brands) ───────────────
const BRAND_BG_PALETTE = [
  '#E8D4B8',
  '#D8E8F2',
  '#F2E8D8',
  'var(--surface-variant)',
  '#D0C8D8',
  '#C8D8C8',
];

interface HomeBrandSectionProps {
  /** All featured products — client side filters them by brand */
  products: ProductCardData[];
  /** API brands — used to build the brand selector */
  brands: Brand[];
}

/**
 * Client island — owns the selected-brand state so the rest of the
 * home page stays a server component and renders instantly.
 */
export default function HomeBrandSection({ products, brands }: HomeBrandSectionProps) {
  const [selectedBrand, setSelectedBrand] = useState<BrandFilterValue>('all');

  // Build BrandSelectorItem list: prepend synthetic "All"
  const selectorItems: BrandSelectorItem[] = useMemo(() => {
    const allItem: BrandSelectorItem = {
      value: 'all',
      label: 'All',
      image: '/images/brands/all.png',
      bg:    'var(--brand-dark)',
    };
    const rest: BrandSelectorItem[] = brands.map((brand, i) => ({
      value: brand.id,
      label: brand.name,
      image: brand.imageUrl ?? `/images/brands/${brand.slug}.png`,
      bg:    BRAND_BG_PALETTE[i % BRAND_BG_PALETTE.length],
    }));
    return [allItem, ...rest];
  }, [brands]);

  const filteredProducts = useMemo(() => {
    if (selectedBrand === 'all') return products;
    return products.filter((p) => p.brandId === selectedBrand);
  }, [products, selectedBrand]);

  const sectionTitle =
    selectedBrand === 'all'
      ? 'All Featured brand products'
      : `Featured ${selectorItems.find((b) => b.value === selectedBrand)?.label ?? ''} products`;

  const viewAllSlug =
    selectedBrand === 'all'
      ? 'all'
      : (brands.find((b) => b.id === selectedBrand)?.slug ?? 'all');

  return (
    <section>
      <BrandSelector
        brands={selectorItems}
        selected={selectedBrand}
        onSelect={setSelectedBrand}
      />
      <SectionHeader
        title={sectionTitle}
        viewAllHref={`/products?brand=${viewAllSlug}`}
      />
      <ProductGrid
        key={String(selectedBrand)}
        items={filteredProducts}
      />
    </section>
  );
}
