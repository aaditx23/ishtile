'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { HeroImageData } from '@/application/home/getActiveHeroImages';

interface HeroImageCardProps {
  slide: HeroImageData;
  mobile?: boolean;
}

export default function HeroImageCard({ slide, mobile = false }: HeroImageCardProps) {
  const alignLeft = slide.contentPosition !== 'right';
  const shouldShowButton = slide.showButton && Boolean(slide.buttonText) && Boolean(slide.buttonUrl);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        src={slide.url}
        alt={slide.title}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.38), rgba(0,0,0,0.2) 65%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: mobile ? '3.5rem' : '2.5rem',
          left: alignLeft ? (mobile ? '1.25rem' : '2.5rem') : undefined,
          right: !alignLeft ? (mobile ? '1.25rem' : '2.5rem') : undefined,
          textAlign: alignLeft ? 'left' : 'right',
          maxWidth: mobile ? '21rem' : '38rem',
          display: 'flex',
          flexDirection: 'column',
          gap: mobile ? '0.55rem' : '0.75rem',
          marginLeft: !alignLeft ? 'auto' : undefined,
        }}
      >
        <h2
          style={{
            color: 'white',
            fontWeight: 900,
            textTransform: 'uppercase',
            lineHeight: 1.2,
            fontSize: mobile ? '1.9rem' : '3.5rem',
          }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: mobile ? '0.8rem' : '0.9rem' }}>
            {slide.subtitle}
          </p>
        )}
        {shouldShowButton && (
          <div style={{ display: 'flex', justifyContent: alignLeft ? 'flex-start' : 'flex-end' }}>
            <Button asChild variant="default" size="sm">
              <Link href={slide.buttonUrl!}>{slide.buttonText}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
