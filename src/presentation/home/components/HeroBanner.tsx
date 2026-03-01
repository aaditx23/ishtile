'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────
type SlideButton = {
  label: string;
  href: string;
  variant: 'solid' | 'outline';
};

type Slide =
  | {
      type: 'split';
      left: { image: string; heading: string; button: SlideButton };
      right: { image: string; heading: string; button: SlideButton };
    }
  | {
      type: 'full';
      desktopImage: string;
      mobileImage: string;
      heading: string;
      subheading?: string;
      buttons: SlideButton[];
      overlay: string;
    };

// ── Slide data ────────────────────────────────────────────────────────────────
const slides: Slide[] = [
  {
    type: 'split',
    left: {
      image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1920&q=80',
      heading: 'HERITAGE\nStyling',
      button: { label: "Shop Collection", href: '/collections/mens-new-arrivals', variant: 'solid' },
    },
    right: {
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1920&q=80',
      heading: 'Urban\nEssentials',
      button: { label: "Shop Now", href: '/collections/mens-essentials', variant: 'solid' },
    },
  },
  {
    type: 'full',
    desktopImage: 'https://images.unsplash.com/photo-1713226370255-ec144523a56b?q=80&w=1920&auto=format&fit=crop',
    mobileImage:  'https://images.unsplash.com/photo-1713226370255-ec144523a56b?q=80&w=900&auto=format&fit=crop',
    heading: 'ACTIVE SEASON. 2',
    overlay: 'linear-gradient(180deg, rgba(46,46,46,0.4), rgba(28,27,25,0.02) 100%)',
    buttons: [
      { label: 'SHOP NOW',     href: '/collections/activewear',         variant: 'solid' },
      { label: 'EXPLORE MORE', href: '/collections/activewear-explore',  variant: 'outline' },
    ],
  },
  {
    type: 'full',
    desktopImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1920&q=80',
    mobileImage:  'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&q=80',
    heading: 'STATE CHAMPS',
    overlay: 'linear-gradient(0deg, rgba(46,46,46,0.4), rgba(28,27,25,0.02) 100%)',
    buttons: [
      { label: 'SHOP NOW', href: '/collections/state-champs', variant: 'solid' },
    ],
  },
  {
    type: 'full',
    desktopImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=1920&q=80',
    mobileImage:  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80',
    heading: 'Join the family',
    subheading: 'Get exclusive benefits and rewards by joining the Loyalty Dept. and becoming an active member of our family.',
    overlay: 'linear-gradient(0deg, rgba(28,26,25,0.2), rgba(28,26,25,0.2) 100%)',
    buttons: [
      { label: 'SIGN UP', href: '/pages/rewards', variant: 'solid' },
    ],
  },
];

// ── Button ────────────────────────────────────────────────────────────────────
function SlideBtn({ btn }: { btn: SlideButton }) {
  return (
    <Button asChild variant={btn.variant === 'solid' ? 'default' : 'outline'} style={{padding:'0.5rem'}}>
      <Link href={btn.href}>{btn.label}</Link>
    </Button>
  );
}

// ── Split Slide ───────────────────────────────────────────────────────────────
function SplitSlide({ slide }: { slide: Extract<Slide, { type: 'split' }> }) {
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
            <SlideBtn btn={col.button} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Full Slide ────────────────────────────────────────────────────────────────
function FullSlide({ slide }: { slide: Extract<Slide, { type: 'full' }> }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Desktop image */}
      <Image
        src={slide.desktopImage}
        alt={slide.heading}
        fill
        style={{ objectFit: 'cover' }}
        className="hidden md:block"
        priority
        sizes="100vw"
      />
      {/* Mobile image */}
      <Image
        src={slide.mobileImage}
        alt={slide.heading}
        fill
        style={{ objectFit: 'cover' }}
        className="md:hidden"
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
        <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
          {slide.buttons.map((btn) => (
            <SlideBtn key={btn.label} btn={btn} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────
export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, []);

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Clear any pending timeout when manually navigating
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [current]);

  const slide = slides[current];

  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Slide */}
      <div style={{ width: '100%', height: '100%' }}>
        {slide.type === 'split' ? (
          <SplitSlide slide={slide} />
        ) : (
          <FullSlide slide={slide} />
        )}
      </div>

      {/* Prev arrow */}
      <Button onClick={prev} aria-label="Previous slide" variant="ghost" size="icon">
        ‹
      </Button>

      {/* Next arrow */}
      <Button onClick={next} aria-label="Next slide" variant="ghost" size="icon">
        ›
      </Button>

      {/* Pagination dots */}
      <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
        {slides.map((_, i) => (
          <Button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            variant={i === current ? 'default' : 'secondary'}
            size="icon-xs"
          />
        ))}
      </div>
    </section>
  );
}
