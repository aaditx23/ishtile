'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ProductVariant } from '@/domain/product/product.entity';

interface VariantPickerProps {
  variants: ProductVariant[];
  onVariantChange: (variant: ProductVariant | null) => void;
}

/**
 * Two-step picker: first select a size, then a colour within that size.
 * Calls onVariantChange whenever the selection resolves to a unique variant.
 */
export default function VariantPicker({ variants, onVariantChange }: VariantPickerProps) {
  const activeVariants = variants.filter((v) => v.isActive);

  const sizes = [...new Set(activeVariants.map((v) => v.size))];
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);

  const colorsForSize = selectedSize
    ? [...new Set(activeVariants.filter((v) => v.size === selectedSize && v.color).map((v) => v.color as string))]
    : [];

  const [selectedColor, setSelectedColor] = useState<string | null>(colorsForSize[0] ?? null);

  const resolvedVariant = activeVariants.find(
    (v) => v.size === selectedSize && (colorsForSize.length === 0 || v.color === selectedColor),
  ) ?? null;

  // Keep parent in sync whenever resolved variant changes
  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    const newColors = [...new Set(activeVariants.filter((v) => v.size === size && v.color).map((v) => v.color as string))];
    const newColor = newColors[0] ?? null;
    setSelectedColor(newColor);
    const variant = activeVariants.find((v) => v.size === size && (newColors.length === 0 || v.color === newColor)) ?? null;
    onVariantChange(variant);
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    const variant = activeVariants.find((v) => v.size === selectedSize && v.color === color) ?? null;
    onVariantChange(variant);
  };

  if (activeVariants.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Size selector */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface-muted)', marginBottom: '0.5rem' }}>
          Size
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? 'default' : 'outline'}
              className="border border-neutral-900"
              style={{ minWidth: '3rem', padding: '0.4rem 1rem', fontSize: '0.875rem' }}
              onClick={() => handleSizeClick(size)}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Color selector — only when variants have colours */}
      {colorsForSize.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface-muted)', marginBottom: '0.5rem' }}>
            Color — <span style={{ fontWeight: 400, textTransform: 'none' }}>{selectedColor}</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {colorsForSize.map((color) => (
              <Button
                key={color}
                variant={selectedColor === color ? 'default' : 'outline'}
                className="border border-neutral-900"
                style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
                onClick={() => handleColorClick(color)}
              >
                {color}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Selected variant price */}
      {resolvedVariant && (
        <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          SKU: <span style={{ fontFamily: 'monospace' }}>{resolvedVariant.sku}</span>
        </p>
      )}
    </div>
  );
}
