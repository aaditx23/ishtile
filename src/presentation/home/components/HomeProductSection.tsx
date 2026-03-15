'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCardSharp from './ProductCardSharp';
import type { ProductCardData } from './ProductCard';

interface HomeProductSectionProps {
  products: ProductCardData[];
  title?: string;
}

export default function HomeProductSection({ products, title = 'Featured Products' }: HomeProductSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -900 : 900,
      behavior: 'smooth',
    });
  };

  const viewAllHref = '/products';

  return (
    <section style={{ padding: '0' }}>
      <div
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          borderLeft: '1px solid var(--brand-dark)',
          borderRight: '1px solid var(--brand-dark)',
          backgroundColor: 'var(--surface)',
          padding: '0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem 1rem 0' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{title}</h2>
          <Link
            href={viewAllHref}
            style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            View All
          </Link>
        </div>

        <div style={{ position: 'relative', marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll products left"
            className="hidden md:flex"
            style={{ position: 'absolute', left: '-0.55rem', top: '40%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <ChevronLeft size={16} style={{ margin: 'auto' }} />
          </button>

          <div
            ref={sliderRef}
            style={{
              display: 'flex',
              gap: '0',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '0',
            }}
            className="hide-scrollbar"
          >
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  flex: '0 0 min(86vw, 410px)',
                  minWidth: 'min(86vw, 410px)',
                  scrollSnapAlign: 'start',
                }}
                className="md:[flex-basis:min(35vw,470px)] md:[min-width:min(35vw,470px)] lg:[flex-basis:min(27vw,470px)] lg:[min-width:min(27vw,470px)] xl:[flex-basis:min(24vw,470px)] xl:[min-width:min(24vw,470px)]"
              >
                <ProductCardSharp product={product} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll products right"
            className="hidden md:flex"
            style={{ position: 'absolute', right: '-0.55rem', top: '40%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <ChevronRight size={16} style={{ margin: 'auto' }} />
          </button>
        </div>
      </div>
    </section>
  );
}
