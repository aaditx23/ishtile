'use client';

import { useEffect, useState } from 'react';
import ProductCardSharp, { type ProductCardData } from './ProductCardSharp';
import EmptyState from '@/presentation/shared/components/EmptyState';

interface ProductGridProps {
  items: ProductCardData[];
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden border border-input bg-white">
      <div className="w-full aspect-[3/4] bg-accent animate-pulse" />
      <div className="flex flex-col items-start gap-2 p-3 sm:p-4">
        <div className="h-4 w-3/4 bg-accent animate-pulse" />
        <div className="h-3 w-1/4 bg-accent animate-pulse" />
        <div className="h-3 w-1/3 bg-accent animate-pulse" />
        <div className="h-9 w-full bg-accent animate-pulse mt-1" />
      </div>
    </div>
  );
}

export default function ProductGrid({ items }: ProductGridProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setVisible(false);
    setLoading(true);
    const loadId = setTimeout(() => setLoading(false), 300);
    const fadeId = requestAnimationFrame(() => setVisible(true));
    return () => {
      clearTimeout(loadId);
      cancelAnimationFrame(fadeId);
    };
  }, [items]);

  if (loading) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        style={{ padding: '2rem 1rem', columnGap: '0.5rem', rowGap: '1.25rem' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 transition-opacity duration-300"
      style={{ padding: '2rem 1rem', columnGap: '0.5rem', rowGap: '1.25rem', opacity: visible ? 1 : 0 }}
    >
      {items.map((product) => (
        <ProductCardSharp key={product.id} product={product} />
      ))}
    </div>
  );
}
