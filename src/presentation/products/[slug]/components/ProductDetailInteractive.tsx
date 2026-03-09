'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VariantPicker from './VariantPicker';
import AddToCartButton from './AddToCartButton';
import type { Product, ProductVariant } from '@/domain/product/product.entity';

interface ProductDetailInteractiveProps {
  product: Product;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

/**
 * Client island — owns variant selection state.
 * Renders live price, variant picker and add-to-cart together so they stay in sync.
 * Stock is read directly from variant.quantity — no extra API call needed.
 */
export default function ProductDetailInteractive({ product }: ProductDetailInteractiveProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] ?? null,
  );

  const variants = product.variants ?? [];
  if (variants.length === 0) return null;

  // Resolve displayed price — prefer variant price, fall back to product base
  const price      = selectedVariant?.price ?? product.basePrice;
  const compareAt  = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const hasSale    = compareAt !== null && compareAt > price;
  const stock      = selectedVariant?.stock ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Live price — updates when variant changes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '1.375rem', fontWeight: 700, color: hasSale ? 'var(--brand-gold)' : 'var(--on-background)' }}>
          {fmt(price)}
        </span>
        {hasSale && compareAt && (
          <>
            <span style={{ fontSize: '1rem', color: 'var(--on-surface-muted)', textDecoration: 'line-through' }}>
              {fmt(compareAt)}
            </span>
            <Badge style={{ backgroundColor: 'var(--brand-gold)', color: 'var(--on-primary)', fontSize: '0.7rem' }}>
              {Math.round((1 - price / compareAt) * 100)}% OFF
            </Badge>
          </>
        )}
      </div>

      <Separator />

      <VariantPicker variants={variants} onVariantChange={setSelectedVariant} />

      <AddToCartButton variant={selectedVariant} availableStock={stock} />
    </div>
  );
}
