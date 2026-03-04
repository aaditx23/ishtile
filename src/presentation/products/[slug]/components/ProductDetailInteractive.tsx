'use client';

import { useState, useEffect } from 'react';
import VariantPicker from './VariantPicker';
import AddToCartButton from './AddToCartButton';
import { getInventory } from '@/application/product/adminProduct';
import type { Product, ProductVariant } from '@/domain/product/product.entity';
import type { InventoryDto } from '@/shared/types/api.types';

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
  
  const [activeInventory, setActiveInventory] = useState<InventoryDto | null>(null);

  useEffect(() => {
    if (!selectedVariant) {
      setActiveInventory(null);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const inv = await getInventory(selectedVariant.id);
        if (isMounted) setActiveInventory(inv);
      } catch (err) {
        if (isMounted) setActiveInventory({
           id: 0,
           variantId: selectedVariant.id,
           quantity: 0,
           reservedQuantity: 0,
           availableQuantity: 0,
           updatedAt: new Date().toISOString()
        });
      }
    })();
    return () => { isMounted = false; };
  }, [selectedVariant]);

  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <VariantPicker variants={variants} onVariantChange={setSelectedVariant} />
      <AddToCartButton
        variant={selectedVariant}
        availableStock={selectedVariant ? (activeInventory?.availableQuantity ?? 0) : 0}
      />
    </div>
  );
}
