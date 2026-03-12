'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/presentation/shared/hooks/useCurrentUser';

// ── Types ─────────────────────────────────────────────────────────────────────
type SlideButton = {
  label: string;
  href: string;
  /** 'auth' = only shown when NOT logged in */
  authGate?: 'guest';
};

type Slide =
  | {
      type: 'split';
      left:  { image: string; heading: string; button: SlideButton };
      right: { image: string; heading: string; button: SlideButton };
    }
  | {
      type: 'full';
      desktopImage: string;
      mobileImage:  string;
      heading:      string;
      subheading?:  string;
      button:       SlideButton;
      overlay:      string;
    };

// ── Slide data ────────────────────────────────────────────────────────────────
const slides: Slide[] = [
  {
    type: 'split',
    left: {
      image:   'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
      heading: 'HERITAGE\nStyling',
      button:  { label: 'Shop Now', href: '/products' },
    },
    right: {
      image:   'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1920&q=80',
      heading: 'Urban\nEssentials',
      button:  { label: 'Shop Now', href: '/products' },
    },
  },
  {
    type:         'full',
    desktopImage: 'https://images.unsplash.com/photo-1713226370255-ec144523a56b?q=80&w=1920&auto=format&fit=crop',
    mobileImage:  'https://images.unsplash.com/photo-1713226370255-ec144523a56b?q=80&w=900&auto=format&fit=crop',
    heading:      'ACTIVE SEASON. 2',
    overlay:      'linear-gradient(180deg, rgba(46,46,46,0.4), rgba(28,27,25,0.02) 100%)',
    button:       { label: 'Shop Now', href: '/products' },
  },
  {
    type:         'full',
    desktopImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1920&q=80',
    mobileImage:  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&q=80',
    heading:      'STATE CHAMPS',
    overlay:      'linear-gradient(0deg, rgba(46,46,46,0.4), rgba(28,27,25,0.02) 100%)',
    button:       { label: 'Shop Now', href: '/products' },
  },
  {
    type:         'full',
    desktopImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1920&q=80',
    mobileImage:  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80',
    heading:      'Join the family',
    subheading:   'Get exclusive benefits and rewards by joining the Loyalty Dept. and becoming an active member of our family.',
    overlay:      'linear-gradient(0deg, rgba(28,26,25,0.2), rgba(28,26,25,0.2) 100%)',
    button:       { label: 'Sign Up', href: '/register', authGate: 'guest' },
  },
];

// ── Slide button ──────────────────────────────────────────────────────────────
function SlideBtn({ btn, isGuest }: { btn: SlideButton; isGuest: boolean }) {
  if (btn.authGate === 'guest' && !isGuest) return null;
  return (
    <Button asChild variant="default" size="sm">
      <Link href={btn.href}>{btn.label}</Link>
    </Button>
  );
}

// ── Split Slide ───────────────────────────────────────────────────────────────
function SplitSlide({ slide, isGuest }: { slide: Extract<Slide, { type: 'split' }>; isGuest: boolean }) {
  const overlay = 'linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2) 32%)';
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {[slide.left, slide.right].map((col, i) => (
        <div key={i} style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
          <Image
            src={col.image}
            alt={col.heading.replace('\n', ' ')}
            fill
            style={{ objectFit: 'cover' }}
            priority={i === 0}
            sizes="50vw"
          />
          <div style={{ position: 'absolute', inset: 0, background: overlay }} />
          <div style={{ position: 'absolute', bottom: '2.5rem', left: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h2
              style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.25, whiteSpace: 'pre-line' }}
              className="text-4xl md:text-5xl"
            >
              {col.heading}
            </h2>
            <SlideBtn btn={col.button} isGuest={isGuest} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Full Slide ────────────────────────────────────────────────────────────────
function FullSlide({ slide, isGuest }: { slide: Extract<Slide, { type: 'full' }>; isGuest: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        src={slide.desktopImage}
        alt={slide.heading}
        fill
        style={{ objectFit: 'cover' }}
        priority
        sizes="100vw"
      />
      <div style={{ position: 'absolute', inset: 0, background: slide.overlay }} />
      <div
        style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '36rem' }}
        className="left-6 md:left-10"
      >
        <h2
          style={{ color: 'white', fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.25 }}
          className="text-4xl md:text-6xl"
        >
          {slide.heading}
        </h2>
        {slide.subheading && (
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', maxWidth: '24rem' }}>
            {slide.subheading}
          </p>
        )}
        <SlideBtn btn={slide.button} isGuest={isGuest} />
      </div>
    </div>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────
export default function HeroBanner() {
  const auth    = useCurrentUser();
  const isGuest = auth.status !== 'authenticated';

  const [current, setCurrent] = useState(0);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX  = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => goTo(current + 1), 5000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, goTo]);

  const onDragStart = (clientX: number) => { dragStartX.current = clientX; };
  const onDragEnd   = (clientX: number) => {
    if (dragStartX.current === null) return;
    const dx = clientX - dragStartX.current;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    dragStartX.current = null;
  };

  const slide = slides[current];

  return (
    <section
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', cursor: 'grab' }}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onMouseLeave={() => { dragStartX.current = null; }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        {slide.type === 'split'
          ? <SplitSlide slide={slide} isGuest={isGuest} />
          : <FullSlide  slide={slide} isGuest={isGuest} />
        }
      </div>

      {/* Pill dots */}
      <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width:           i === current ? '1.5rem' : '0.45rem',
              height:          '0.45rem',
              backgroundColor: i === current ? 'var(--brand-gold)' : 'rgba(255,255,255,0.5)',
              border:          'none',
              padding:         0,
              cursor:          'pointer',
              transition:      'width 0.3s, background-color 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  );
}
