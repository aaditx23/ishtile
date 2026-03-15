'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import HomeProductSection from './components/HomeProductSection';
import HomeBrandSection from './components/HomeBrandSection';
import CategoryExploreBlock from './components/CategoryExploreBlock';
import LookbookSection from './components/LookbookSection';
import HeroImageCard from './components/HeroImageCard';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';
import type { HeroImageData } from '@/application/home/getActiveHeroImages';

const FALLBACK_HEROES: HeroImageData[] = [
  {
    id: 'fallback-join-family-mobile',
    url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80',
    title: 'Join the family',
    subtitle: 'Get exclusive benefits and rewards by joining the Loyalty Dept. and becoming an active member of our family.',
    contentPosition: 'left',
    showButton: false,
    buttonText: null,
    buttonUrl: null,
    isActive: true,
  },
];

function MobileHeroBanner({ heroImages }: { heroImages: HeroImageData[] }) {
  const slides = heroImages.length > 0 ? heroImages : FALLBACK_HEROES;
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartX = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => goTo(current + 1), 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, goTo]);

  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  const onDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };

  const onDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;
    const dx = clientX - dragStartX.current;
    if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    dragStartX.current = null;
  };

  const slide = slides[current];

  return (
    <section
      style={{ position: 'relative', width: '100%', height: '60svh', overflow: 'hidden', cursor: 'grab' }}
      onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onMouseLeave={() => {
        dragStartX.current = null;
      }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <HeroImageCard slide={slide} mobile />
      </div>

      <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4rem', zIndex: 10 }}>
        {slides.map((item, index) => (
          <button
            key={item.id}
            onClick={() => goTo(index)}
            aria-label={`Slide ${index + 1}`}
            style={{
              width: index === current ? '1.5rem' : '0.45rem',
              height: '0.45rem',
              backgroundColor: index === current ? 'var(--brand-gold)' : 'rgba(255,255,255,0.5)',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              transition: 'width 0.3s, background-color 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  );
}

interface MobileHomePageProps {
  products: ProductCardData[];
  trendingProducts: ProductCardData[];
  categories: Category[];
  brands: Brand[];
  lookbooks: Lookbook[];
  heroImages: HeroImageData[];
}

export default function MobileHomePage({ products, trendingProducts, categories, brands, lookbooks, heroImages }: MobileHomePageProps) {
  return (
    <div>
      <MobileHeroBanner heroImages={heroImages} />
      <HomeProductSection products={products} />
      <CategoryExploreBlock categories={categories} />
      <HomeProductSection products={trendingProducts} title="Trending Products" />
      <LookbookSection lookbooks={lookbooks} />
      <HomeBrandSection brands={brands} />
    </div>
  );
}
