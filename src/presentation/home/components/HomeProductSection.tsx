'use client';

import { useMemo, useState } from 'react';
import CategorySelector, {
  type CategoryFilterValue,
  type CategorySelectorItem,
} from './CategorySelector';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';
import type { ProductCardData } from './ProductCard';
import type { Category } from '@/domain/category/category.entity';

// ── Static backgrounds per category index (cycles if more categories) ────────
const CATEGORY_BG_PALETTE = [
  'var(--brand-dark)',
  '#B8D4E8',
  '#F2D0D8',
  'var(--surface-variant)',
  '#D6CFC5',
  '#C8D8BF',
];

interface HomeProductSectionProps {
  /** All featured products — client side filters them by category */
  products: ProductCardData[];
  /** API categories — used to build the category selector */
  categories: Category[];
}

/**
 * Client island — owns the selected-category state so the rest of the
 * home page stays a server component and renders instantly.
 */
export default function HomeProductSection({ products, categories }: HomeProductSectionProps) {
  const [selectedCat, setSelectedCat] = useState<CategoryFilterValue>('all');

  // Build CategorySelectorItem list: prepend synthetic "All"
  const selectorItems: CategorySelectorItem[] = useMemo(() => {
    const allItem: CategorySelectorItem = {
      value: 'all',
      label: 'All',
      image: '/images/categories/all.png',
      bg:    'var(--brand-dark)',
    };
    const rest: CategorySelectorItem[] = categories.map((cat, i) => ({
      value: cat.id,
      label: cat.name,
      image: cat.imageUrl ?? `/images/categories/${cat.slug}.png`,
      bg:    CATEGORY_BG_PALETTE[(i + 1) % CATEGORY_BG_PALETTE.length],
    }));
    return [allItem, ...rest];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (selectedCat === 'all') return products;
    return products.filter((p) => p.categoryId === selectedCat);
  }, [products, selectedCat]);

  const sectionTitle =
    selectedCat === 'all'
      ? 'All New Arrivals'
      : `${selectorItems.find((c) => c.value === selectedCat)?.label ?? ''} New Arrivals`;

  const viewAllSlug =
    selectedCat === 'all'
      ? 'all'
      : (categories.find((c) => c.id === selectedCat)?.slug ?? 'all');

  return (
    <section>
      <CategorySelector
        categories={selectorItems}
        selected={selectedCat}
        onSelect={setSelectedCat}
      />
      <SectionHeader
        title={sectionTitle}
        viewAllHref={`/products?category=${viewAllSlug}`}
      />
      <ProductGrid
        key={String(selectedCat)}
        items={filteredProducts}
      />
    </section>
  );
}
