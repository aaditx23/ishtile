'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

interface LookbookDetailViewProps {
  lookbook: Lookbook;
}

const SWIPE_THRESHOLD = 50;
const TRANSITION_DURATION = 'opacity 380ms ease';

export default function LookbookDetailView({ lookbook }: LookbookDetailViewProps) {
  const slides = useMemo(
    () => (lookbook.imageUrls.length > 0 ? lookbook.imageUrls : [lookbook.coverImageUrl]),
    [lookbook.coverImageUrl, lookbook.imageUrls],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const dragStartXRef = useRef<number | null>(null);

  // Memoized slide navigation with wrapping
  const navigate = useCallback((delta: number) => {
    setCurrentIndex((prev) => (prev + delta + slides.length) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => navigate(-1), [navigate]);
  const goToNext = useCallback(() => navigate(1), [navigate]);

  // Drag/swipe handlers: unified touch + mouse support
  const handleDragStart = useCallback((clientX: number) => {
    dragStartXRef.current = clientX;
  }, []);

  const handleDragEnd = useCallback(
    (clientX: number) => {
      if (dragStartXRef.current === null) return;

      const delta = clientX - dragStartXRef.current;

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        // Drag left → next, drag right → previous
        navigate(delta < 0 ? 1 : -1);
      }

      dragStartXRef.current = null;
    },
    [navigate],
  );

  const handleDragCancel = useCallback(() => {
    dragStartXRef.current = null;
  }, []);

  // Section styles
  const sectionStyles: React.CSSProperties = {
    width: '100%',
    height: 'calc(100svh - 4rem)',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--surface-muted)',
    cursor: 'grab',
    userSelect: 'none',
  };

  // Slide container styles
  const slideContainerStyles: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
  };

  // Individual slide styles (positioned absolutely, faded in/out)
  const getSlideStyles = (index: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    opacity: index === currentIndex ? 1 : 0,
    transition: TRANSITION_DURATION,
    pointerEvents: index === currentIndex ? 'auto' : 'none',
  });

  // Navigation button styles (reusable)
  const navButtonStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '2.1rem',
    height: '2.1rem',
    border: '1px solid var(--brand-dark)',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    cursor: 'pointer',
    padding: 0,
  };

  // Indicator dot styles
  const getIndicatorStyles = (index: number): React.CSSProperties => ({
    display: 'block',
    width: index === currentIndex ? '1.2rem' : '0.42rem',
    height: '0.42rem',
    backgroundColor:
      index === currentIndex
        ? 'var(--surface)'
        : 'color-mix(in srgb, var(--surface) 55%, transparent)',
    transition: 'width 0.2s ease',
  });

  if (slides.length === 0) {
    return (
      <section style={sectionStyles}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--on-surface-muted)' }}>
          No images available
        </div>
      </section>
    );
  }

  const isMultiSlide = slides.length > 1;

  return (
    <section
      style={sectionStyles}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => { e.preventDefault(); handleDragStart(e.clientX); }}
      onMouseUp={(e) => handleDragEnd(e.clientX)}
      onMouseLeave={handleDragCancel}
    >
      {/* Slide Container */}
      <div style={slideContainerStyles}>
        {slides.map((imageUrl, index) => (
          <div key={`slide-${index}`} style={getSlideStyles(index)} draggable={false}>
            <Image
              src={imageUrl}
              alt={`${lookbook.title} slide ${index + 1}`}
              fill
              style={{ objectFit: 'cover', userSelect: 'none' }}
              sizes="100vw"
              priority={index === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Navigation Controls (only show if multiple slides) */}
      {isMultiSlide && (
        <>
          {/* Previous Button */}
          <button
            type="button"
            onClick={goToPrevious}
            aria-label={`View previous image (${currentIndex} of ${slides.length})`}
            style={{ ...navButtonStyles, left: '0.8rem' }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={goToNext}
            aria-label={`View next image (${currentIndex + 1} of ${slides.length})`}
            style={{ ...navButtonStyles, right: '0.8rem' }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>

          {/* Indicator Dots */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.8rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.3rem',
              zIndex: 10,
            }}
            role="status"
            aria-live="polite"
            aria-label={`Image ${currentIndex + 1} of ${slides.length}`}
          >
            {slides.map((_, index) => (
              <span key={`indicator-${index}`} style={getIndicatorStyles(index)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
