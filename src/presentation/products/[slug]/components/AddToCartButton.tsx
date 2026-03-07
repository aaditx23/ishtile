'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { addToCart } from '@/application/cart/addToCart';
import type { ProductVariant } from '@/domain/product/product.entity';

interface AddToCartButtonProps {
  variant: ProductVariant | null;
  /** Stock available for the selected variant */
  availableStock?: number;
}

export default function AddToCartButton({ variant, availableStock = 0 }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  const outOfStock = !variant || availableStock === 0;
  const maxQty = availableStock;

  const handleAddToCart = async () => {
    if (!variant) {
      toast.error('Please select a size first.');
      return;
    }
    setLoading(true);
    try {
      await addToCart(variant.id, qty);
      toast.success('Added to cart!');
    } catch {
      toast.error('Could not add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Quantity selector */}
      {!outOfStock && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--on-surface-muted)' }}>
            Qty
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '2rem', height: '2rem', padding: 0 }}
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </Button>
            <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{qty}</span>
            <Button
              variant="outline"
              size="sm"
              style={{ width: '2rem', height: '2rem', padding: 0 }}
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            {availableStock} in stock
          </span>
        </div>
      )}

      <Button
        size="lg"
        className="w-full tracking-widest uppercase"
        disabled={outOfStock || loading}
        onClick={handleAddToCart}
      >
        {loading       ? 'Adding…'     :
         outOfStock    ? 'Out of Stock' :
         !variant      ? 'Select a Size' :
                         'Add to Cart'}
      </Button>
    </div>
  );
}
