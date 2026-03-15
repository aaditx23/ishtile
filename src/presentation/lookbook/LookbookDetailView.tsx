'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

interface LookbookDetailViewProps {
  lookbook: Lookbook;
}

export default function LookbookDetailView({ lookbook }: LookbookDetailViewProps) {
  const slides = useMemo(
    () => (lookbook.imageUrls.length > 0 ? lookbook.imageUrls : [lookbook.coverImageUrl]),
    [lookbook.coverImageUrl, lookbook.imageUrls],
  );
  const [current, setCurrent] = useState(0);

  const goPrev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
      <div style={{ marginBottom: '0.8rem' }}>
        <Link href="/" style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
          Back
        </Link>
      </div>

      <h1 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lookbook.title}</h1>
      {lookbook.body ? (
        <p style={{ marginTop: '0.45rem', marginBottom: '1rem', color: 'var(--on-surface-muted)', fontSize: '0.88rem', lineHeight: 1.55 }}>{lookbook.body}</p>
      ) : null}

      <div style={{ position: 'relative', border: '1px solid var(--brand-dark)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10', background: 'var(--surface-muted)' }}>
          <Image src={slides[current]} alt={`${lookbook.title} ${current + 1}`} fill style={{ objectFit: 'cover' }} sizes="100vw" priority={current === 0} />
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', width: '2.1rem', height: '2.1rem', border: '1px solid var(--brand-dark)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', width: '2.1rem', height: '2.1rem', border: '1px solid var(--brand-dark)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        ) : null}
      </div>

      <p style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
        {current + 1} / {slides.length}
      </p>
    </div>
  );
}
