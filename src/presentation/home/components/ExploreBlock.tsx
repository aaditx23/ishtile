'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ExploreBlockItem {
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface ExploreBlockProps {
  title: string;
  items: ExploreBlockItem[];
  queryKey: 'category' | 'brand';
  sectionPadding: string;
  showShopAll?: boolean;
}

export default function ExploreBlock({
  title,
  items,
  queryKey,
  sectionPadding,
  showShopAll = false,
}: ExploreBlockProps) {
  const visibleItems = items.slice(0, 6);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (visibleItems.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -700 : 700,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;

    const onScroll = () => {
      const firstChild = node.children[0] as HTMLElement | undefined;
      if (!firstChild) {
        setActiveIndex(0);
        return;
      }
      const cardWidth = firstChild.offsetWidth;
      const style = window.getComputedStyle(node);
      const gap = Number.parseFloat(style.columnGap || style.gap || '0') || 0;
      const stride = cardWidth + gap;
      const idx = stride > 0 ? Math.round(node.scrollLeft / stride) : 0;
      setActiveIndex(Math.max(0, Math.min(visibleItems.length - 1, idx)));
    };

    node.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => node.removeEventListener('scroll', onScroll);
  }, [visibleItems.length]);

  return (
    <section style={{ padding: sectionPadding }}>
      <div
        style={{
          borderTop: '1px solid var(--brand-dark)',
          borderBottom: '1px solid var(--brand-dark)',
          backgroundColor: 'var(--surface)',
          padding: '1.15rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center' }}>{title}</h2>
          {showShopAll ? (
            <Link
              href="/products"
              style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              Shop All
            </Link>
          ) : null}
        </div>

        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden md:flex"
            style={{ position: 'absolute', left: '-0.55rem', top: '45%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <ChevronLeft size={16} style={{ margin: 'auto' }} />
          </button>

          <div
            ref={sliderRef}
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '0.25rem',
            }}
            className="hide-scrollbar"
          >
            {visibleItems.map((item) => (
              <Link
                key={item.id}
                href={`/products?${queryKey}=${encodeURIComponent(item.slug)}`}
                style={{
                  flex: '0 0 min(100%, 500px)',
                  minWidth: 'min(100%, 500px)',
                  scrollSnapAlign: 'start',
                  border: '1px solid var(--brand-dark)',
                  backgroundColor: 'var(--surface)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', borderBottom: '1px solid var(--brand-dark)', background: 'var(--surface-muted)' }}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="500px"
                    />
                  ) : null}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '64px',
                    padding: '0.75rem 0.8rem',
                    backgroundColor: 'var(--surface)',
                  }}
                >
                  <p style={{ color: 'var(--on-surface)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {item.name}
                  </p>
                  <span style={{ color: 'var(--on-surface)', fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{'>'}</span>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden md:flex"
            style={{ position: 'absolute', right: '-0.55rem', top: '45%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <ChevronRight size={16} style={{ margin: 'auto' }} />
          </button>

          {visibleItems.length > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '0.65rem' }}>
              {visibleItems.map((item, index) => (
                <span
                  key={`${item.id}-${index}`}
                  style={{
                    display: 'block',
                    width: index === activeIndex ? '1.25rem' : '0.42rem',
                    height: '0.42rem',
                    backgroundColor: index === activeIndex ? 'var(--on-surface)' : 'color-mix(in srgb, var(--on-surface) 35%, transparent)',
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}