import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/domain/product/product.entity';

interface ProductMetaProps {
  product: Product;
  /** When true, the price block is omitted (price is rendered by the interactive client component instead) */
  hidePrice?: boolean;
  /** Resolved price from the selected variant (falls back to basePrice) */
  displayPrice?: number;
  /** Compare-at price for strike-through */
  compareAtPrice?: number | null;
  categoryName?: string;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

/**
 * Static product information — server-renderable (no interactivity).
 */
export default function ProductMeta({ product, hidePrice, displayPrice, compareAtPrice, categoryName }: ProductMetaProps) {
  const price       = displayPrice ?? product.basePrice;
  const compareAt   = compareAtPrice ?? product.compareAtPrice;
  const hasSale     = compareAt !== null && compareAt > price;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Category badge */}
      {categoryName && (
        <Badge variant="secondary" style={{ width: 'fit-content', borderRadius: '9999px', padding: '0.4rem 1rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
          {categoryName}
        </Badge>
      )}

      {/* Name */}
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
        {product.name}
      </h1>

      {/* Price */}
      {!hidePrice && (
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
      )}

      <Separator />

      {/* Description */}
      {product.description && (
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--on-surface)' }}>
          {product.description}
        </p>
      )}

      {/* Material & care */}
      {(product.material || product.careInstructions) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {product.material && (
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
              <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Material:</span>{' '}
              {product.material}
            </p>
          )}
          {product.careInstructions && (
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
              <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Care:</span>{' '}
              {product.careInstructions}
            </p>
          )}
        </div>
      )}

      {/* Brand */}
      {product.brand && (
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
          <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Brand:</span>{' '}
          {product.brand}
        </p>
      )}
    </div>
  );
}
