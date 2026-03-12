'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImagesProps {
  images: string[];
  productName: string;
}

/**
 * Image gallery with main display + thumbnail strip + prev/next arrows.
 */
export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [active, setActive] = useState(0);
  const count = images.length;

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Main image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--surface-variant)' }}>
        <Image
          src={images[active]}
          alt={`${productName} — image ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />

        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-sm transition"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>

            {/* Dot indicators */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width:  i === active ? '16px' : '6px',
                    height: '6px',
                    backgroundColor: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'width 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink:   0,
                width:        '72px',
                height:       '96px',
                overflow:     'hidden',
                position:     'relative',
                border:       i === active ? '2px solid var(--brand-gold)' : '2px solid transparent',
                cursor:       'pointer',
              }}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={src} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
