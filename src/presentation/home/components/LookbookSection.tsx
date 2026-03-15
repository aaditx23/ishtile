'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

interface LookbookSectionProps {
  lookbooks: Lookbook[];
}

export default function LookbookSection({ lookbooks }: LookbookSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  if (lookbooks.length === 0) return null;

  const toExcerpt = (body: string | null) => {
    const text = (body ?? '').trim();
    if (text.length <= 160) return text;
    return `${text.slice(0, 160).trim()}...`;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -900 : 900,
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
      setActiveIndex(Math.max(0, Math.min(lookbooks.length - 1, idx)));
    };

    node.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => node.removeEventListener('scroll', onScroll);
  }, [lookbooks.length]);

  // Show scroll controls only when content actually overflows
  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;
    const check = () => setCanScroll(node.scrollWidth > node.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(node);
    return () => ro.disconnect();
  }, [lookbooks.length]);

  return (
    <section style={{ padding: '1.25rem 0 1.25rem' }}>
      <div
        style={{
          borderTop: '1px solid var(--brand-dark)',
          borderBottom: '1px solid var(--brand-dark)',
          backgroundColor: 'var(--surface)',
          padding: '1.15rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>View lookbooks</h3>
          <Link
            href="/lookbook"
            style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            View Lookbook
          </Link>
        </div>

        <div style={{ position: 'relative', marginTop: '1rem' }}>
          {canScroll && (
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Scroll lookbooks left"
              className="hidden md:flex"
              style={{ position: 'absolute', left: '-0.55rem', top: '40%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <ChevronLeft size={16} style={{ margin: 'auto' }} />
            </button>
          )}

          <div
            ref={sliderRef}
            style={{
              display: 'flex',
              gap: '0.85rem',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingBottom: '0.25rem',
            }}
            className="hide-scrollbar"
          >
            {lookbooks.map((item) => (
              <article
                key={item.id}
                style={{
                  flex: '0 0 min(100%, 500px)',
                  minWidth: 'min(100%, 500px)',
                  scrollSnapAlign: 'start',
                  border: '1px solid var(--brand-dark)',
                  backgroundColor: 'var(--surface)',
                  overflow: 'hidden',
                }}
              >
                <Link href={`/lookbook/${item.slug}`}>
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', borderBottom: '1px solid var(--brand-dark)', background: 'var(--surface-muted)' }}>
                    <Image src={item.coverImageUrl} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 66vw" />
                  </div>
                </Link>

                <div style={{ padding: '0.9rem 0.95rem 1rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</h4>
                  <p style={{ marginTop: '0.45rem', fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--on-surface-muted)' }}>
                    {toExcerpt(item.body)}
                  </p>
                  <Link
                    href={`/lookbook/${item.slug}`}
                    style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {canScroll && (
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Scroll lookbooks right"
              className="hidden md:flex"
              style={{ position: 'absolute', right: '-0.55rem', top: '40%', transform: 'translateY(-50%)', zIndex: 20, width: '2rem', height: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}
            >
              <ChevronRight size={16} style={{ margin: 'auto' }} />
            </button>
          )}

          {canScroll && lookbooks.length > 1 ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginTop: '0.65rem' }}>
              {lookbooks.map((item, index) => (
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
