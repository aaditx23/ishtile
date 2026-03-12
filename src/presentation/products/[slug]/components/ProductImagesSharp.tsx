'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImagesSharpProps {
  images: string[];
  productName: string;
}

/**
 * Sharp design image gallery:
 * - Desktop: Vertical stack with up/down navigation (P&Co style)
 * - Mobile: Carousel with sharp corners and rectangle pagination
 * - No rounded corners anywhere
 */
export default function ProductImagesSharp({ images, productName }: ProductImagesSharpProps) {
  const [active, setActive] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const count = images.length;

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  const scrollToImage = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const imageElements = container.querySelectorAll('[data-image-index]');
    const targetElement = imageElements[index] as HTMLElement;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const imageHeight = container.offsetHeight;
    const newActive = Math.round(scrollTop / imageHeight);
    if (newActive !== active && newActive >= 0 && newActive < count) {
      setActive(newActive);
    }
  };

  if (count === 0) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '3/4',
          backgroundColor: 'var(--surface-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--on-surface-muted)',
          fontSize: '0.875rem',
        }}
      >
        No image
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Vertical Stack */}
      <div className="hidden md:block relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {images.map((src, i) => (
            <div
              key={i}
              data-image-index={i}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                position: 'relative',
                backgroundColor: 'var(--surface-variant)',
                scrollSnapAlign: 'start',
              }}
            >
              <Image
                src={src}
                alt={`${productName} — image ${i + 1}`}
                fill
                className="object-cover"
                sizes="50vw"
                priority={i < 3}
                loading={i < 3 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {count > 1 && (
          <>
            <button
              onClick={() => {
                prev();
                scrollToImage(active - 1 < 0 ? count - 1 : active - 1);
              }}
              className="absolute left-1/2 top-4 -translate-x-1/2 bg-white/70 hover:bg-white w-9 h-9 flex items-center justify-center shadow-sm transition border border-neutral-900"
              aria-label="Previous image"
              style={{ zIndex: 10 }}
            >
              <ChevronUp size={20} className="text-gray-800" />
            </button>
            <button
              onClick={() => {
                next();
                scrollToImage((active + 1) % count);
              }}
              className="absolute left-1/2 bottom-4 -translate-x-1/2 bg-white/70 hover:bg-white w-9 h-9 flex items-center justify-center shadow-sm transition border border-neutral-900"
              aria-label="Next image"
              style={{ zIndex: 10 }}
            >
              <ChevronDown size={20} className="text-gray-800" />
            </button>

            {/* Rectangle Pagination */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '1rem',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                zIndex: 10,
              }}
            >
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '6px',
                    height: i === active ? '20px' : '6px',
                    backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'height 0.2s ease',
                    cursor: 'pointer',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                  onClick={() => {
                    setActive(i);
                    scrollToImage(i);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile: Sharp Carousel */}
      <div className="md:hidden">
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--surface-variant)' }}>
          <Image
            src={images[active]}
            alt={`${productName} — image ${active + 1}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />

          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white w-9 h-9 flex items-center justify-center shadow-sm transition border border-neutral-900"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="text-gray-800" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white w-9 h-9 flex items-center justify-center shadow-sm transition border border-neutral-900"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="text-gray-800" />
              </button>

              {/* Rectangle Pagination Indicators */}
              <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                {images.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'block',
                      width: i === active ? '20px' : '6px',
                      height: '6px',
                      backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
                      transition: 'width 0.2s ease',
                      cursor: 'pointer',
                      border: '1px solid rgba(0,0,0,0.1)',
                    }}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
