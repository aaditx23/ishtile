'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export type BrandFilterValue = 'all' | number;

export interface BrandSelectorItem {
  value: BrandFilterValue;
  label: string;
  image?: string;
  /** Background colour. Accepts any CSS color or var(). */
  bg?: string;
}

interface BrandCardProps extends BrandSelectorItem {
  selected: boolean;
  onClick: () => void;
}

interface BrandSelectorProps {
  brands: BrandSelectorItem[];
  selected: BrandFilterValue;
  onSelect: (value: BrandFilterValue) => void;
}

// ── Brand Card ────────────────────────────────────────────────────────────────

function BrandCard({ label, image, bg = 'var(--product-bg)', selected, onClick }: BrandCardProps) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const validImage = (() => {
    if (!image) return null;
    try {
      new URL(image);
      return image;
    } catch {
      return null;
    }
  })();

  return (

    <article
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={0}
      style={{
        position:        'relative',
        overflow:        'hidden',
        cursor:          'pointer',
        flexShrink:      0,
        width:           'clamp(110px, 28vw, 220px)',
        minWidth:        'unset',
        backgroundColor: bg,
        border:          selected ? '1px solid var(--brand-gold)' : '1px solid var(--brand-dark)',
      }}
      className="group bg-product-bg transition-all duration-200 hover:brightness-105 hover:shadow-md"
      aria-pressed={selected}
      aria-label={`Filter by ${label}`}
    >
      <div className="relative" style={{ lineHeight: 0 }}>
        <div className="relative aspect-[4/5] overflow-hidden bg-product-bg leading-none">
          {validImage ? (
          <Image
            src={validImage}
            alt={label}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="(max-width: 768px) 150px, 20vw"
          />
          ) : null}
        </div>
      </div>

      <div
        style={{
          minHeight: 'clamp(2.75rem, 11vw, 3.5rem)',
          padding: '0.6rem clamp(0.45rem, 2vw, 0.8rem)',
          backgroundColor: 'var(--product-bg)',
          borderTop: '1px solid var(--brand-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.6rem',
        }}
      >
        <span style={{ color: 'var(--on-surface)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 'clamp(0.62rem, 2.2vw, 0.84rem)', lineHeight: 1.1 }}>
          {label}
        </span>
        <span style={{ color: 'var(--on-surface)', fontSize: '0.95rem', fontWeight: 700, lineHeight: 1 }}>
          &gt;
        </span>
      </div>

      {selected && (
        <span
          style={{
            position: 'absolute',
            left: '0.65rem',
            bottom: '0.4rem',
            display: 'block',
            height: '2px',
            width: '1.6rem',
            backgroundColor: 'var(--brand-gold)',
          }}
        />
      )}
    </article>
  );
}

// ── Selector ──────────────────────────────────────────────────────────────────

export default function BrandSelector({ brands, selected, onSelect }: BrandSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        ref.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [brands]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div style={{ position: 'relative', padding: 'clamp(1.5rem, 4vw, 3rem) 0' }}>
      {/* Left scroll button */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/70 hover:bg-surface rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-gray-800" />
        </button>
      )}

      {/* Right scroll button */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/70 hover:bg-surface rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-gray-800" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '0.5rem clamp(1rem, 5vw, 3rem)',
        }}
        className="hide-scrollbar"
      >
        <div style={{ display: 'flex', gap: 'clamp(0.4rem, 2vw, 1rem)', justifyContent: 'center', minWidth: 'max-content' }}>
          {brands.map((brand) => (
            <BrandCard
              key={String(brand.value)}
              {...brand}
              selected={brand.value === selected}
              onClick={() => onSelect(brand.value)}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
