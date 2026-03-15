'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

interface LookbookVerticalSliderProps {
  lookbooks: Lookbook[];
}

const SLIDE_HEIGHT = 'calc(100svh - 4rem)';

export default function LookbookVerticalSlider({ lookbooks }: LookbookVerticalSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const node = sliderRef.current;
    if (!node) return;

    const onScroll = () => {
      if (node.clientHeight <= 0) {
        setActiveIndex(0);
        return;
      }

      const index = Math.round(node.scrollTop / node.clientHeight);
      setActiveIndex(Math.max(0, Math.min(lookbooks.length - 1, index)));
    };

    node.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      node.removeEventListener('scroll', onScroll);
    };
  }, [lookbooks.length]);

  const goToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const boundedIndex = Math.max(0, Math.min(lookbooks.length - 1, index));
    sliderRef.current.scrollTo({
      top: boundedIndex * sliderRef.current.clientHeight,
      behavior: 'smooth',
    });
  };

  const scrollByDirection = (direction: 'up' | 'down') => {
    goToIndex(activeIndex + (direction === 'up' ? -1 : 1));
  };

  if (lookbooks.length === 0) {
    return (
      <div style={{ border: '1px solid var(--brand-dark)', background: 'var(--surface)', padding: '1rem' }}>
        <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>No lookbooks found.</p>
      </div>
    );
  }

  return (
    <section style={{ position: 'relative', width: '100%', height: SLIDE_HEIGHT, background: 'var(--surface-muted)', overflow: 'hidden' }}>
      <div
        ref={sliderRef}
        className="hide-scrollbar"
        style={{
          height: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          scrollSnapType: 'y mandatory',
        }}
      >
        {lookbooks.map((item) => (
          <article
            key={item.id}
            style={{
              flex: '0 0 100%',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              height: SLIDE_HEIGHT,
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Image src={item.coverImageUrl} alt={item.title} fill style={{ objectFit: 'cover', backgroundColor: 'var(--surface-muted)' }} sizes="100vw" />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                textAlign: 'center',
                padding: '1rem',
                background:
                  'linear-gradient(to top, color-mix(in srgb, var(--brand-dark) 55%, transparent), color-mix(in srgb, var(--brand-dark) 25%, transparent))',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.3rem, 2.8vw, 2.2rem)',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--surface)',
                }}
              >
                {item.title}
              </h2>
              <Link
                href={`/lookbook/${item.slug}`}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textDecoration: 'underline',
                  textUnderlineOffset: '4px',
                  color: 'var(--surface)',
                }}
              >
                View Lookbook
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.9rem',
        }}
      >
        <button
          type="button"
          onClick={() => scrollByDirection('up')}
          aria-label="Previous lookbook"
          style={{
            width: '2rem',
            height: '2rem',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronUp size={16} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.14rem' }}>
          {lookbooks.map((item, index) => (
            <button
              type="button"
              onClick={() => goToIndex(index)}
              key={`${item.id}-${index}`}
              aria-label={`Go to lookbook ${index + 1}`}
              style={{
                display: 'block',
                width: '0.26rem',
                height: '2.35rem',
                backgroundColor: index === activeIndex ? 'var(--brand-dark)' : 'color-mix(in srgb, var(--surface) 70%, transparent)',
                border: '1px solid color-mix(in srgb, var(--brand-dark) 75%, transparent)',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollByDirection('down')}
          aria-label="Next lookbook"
          style={{
            width: '2rem',
            height: '2rem',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronDown size={16} />
        </button>
      </div>
    </section>
  );
}
