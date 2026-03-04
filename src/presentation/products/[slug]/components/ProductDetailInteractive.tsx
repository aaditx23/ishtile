'use client';

import { useState } from 'react';
import VariantPicker from './VariantPicker';
import AddToCartButton from './AddToCartButton';
import type { Product, ProductVariant } from '@/domain/product/product.entity';

interface ProductDetailInteractiveProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

/**
 * Client island — owns the variant selection state.
 * Renders VariantPicker + AddToCartButton together so they stay in sync.
 */
export default function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null,
  );

  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <VariantPicker variants={variants} onVariantChange={setSelectedVariant} />
      <AddToCartButton
        variant={selectedVariant}
        availableStock={selectedVariant ? 999 : 0} // real stock fetched separately if needed
      />
    </div>
  );
}
