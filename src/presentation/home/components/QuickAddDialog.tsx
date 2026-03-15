'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import VariantPicker from '@/presentation/products/[slug]/components/VariantPicker';
import { addToCart } from '@/application/cart/addToCart';
import { getProductById } from '@/application/product/getProductById';
import type { Product, ProductVariant } from '@/domain/product/product.entity';

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
  productSlug: string;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function QuickAddDialog({
  open,
  onOpenChange,
  productId,
  productName,
  productSlug,
}: QuickAddDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  // Fetch variants when dialog opens
  useEffect(() => {
    if (!open) return;

    setProduct(null);
    setSelectedVariant(null);
    setQty(1);
    setLoading(true);

    getProductById(productId, true).then((p) => {
      setProduct(p);
      if (p?.variants?.length) {
        const first = p.variants.find((v) => v.isActive) ?? null;
        setSelectedVariant(first);
      }
      setLoading(false);
    });
  }, [open, productId]);

  const activeVariants = product?.variants?.filter((v) => v.isActive) ?? [];
  const stock = selectedVariant?.stock ?? 0;
  const price = selectedVariant?.price ?? product?.basePrice ?? 0;
  const compareAt = selectedVariant?.compareAtPrice ?? product?.compareAtPrice ?? null;
  const hasSale = compareAt !== null && compareAt > price;
  const outOfStock = !selectedVariant || stock === 0;
  const maxQty = stock;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a size first.');
      return;
    }
    setAdding(true);
    try {
      await addToCart(selectedVariant.id, qty);
      toast.success('Added to cart!');
      onOpenChange(false);
    } catch {
      toast.error('Could not add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-base font-semibold leading-snug pr-8">
            {productName}
          </SheetTitle>
          <SheetDescription asChild>
            <Link
              href={`/products/${productSlug}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              View full details <ExternalLink size={11} />
            </Link>
          </SheetDescription>
        </SheetHeader>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 1rem' }} />

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {loading ? (
            /* Loading skeleton */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton className="h-4 w-16" />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Skeleton className="h-9 w-14" />
                <Skeleton className="h-9 w-14" />
                <Skeleton className="h-9 w-14" />
              </div>
              <Skeleton className="h-10 w-full mt-2" />
            </div>
          ) : activeVariants.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
              No variants available for this product.
            </p>
          ) : (
            <>
              {/* Live price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: hasSale ? 'var(--brand-gold)' : 'var(--on-background)',
                }}>
                  {fmt(price)}
                </span>
                {hasSale && compareAt && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', textDecoration: 'line-through' }}>
                    {fmt(compareAt)}
                  </span>
                )}
              </div>

              {/* Variant picker */}
              <VariantPicker variants={activeVariants} onVariantChange={(v) => {
                setSelectedVariant(v);
                setQty(1);
              }} />

              {/* Qty + stock */}
              {!outOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--on-surface-muted)',
                  }}>
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
                    <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                      {qty}
                    </span>
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
                    {stock} in stock
                  </span>
                </div>
              )}

              {/* Add to cart */}
              <Button
                size="lg"
                className="w-full tracking-widest uppercase"
                disabled={outOfStock || adding}
                onClick={handleAddToCart}
              >
                {adding       ? 'Adding…'     :
                 outOfStock   ? 'Out of Stock' :
                               'Add to Cart'}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
