'use client';

import { useEffect, useState } from 'react';
import ProductCard, { type ProductCardData } from './ProductCard';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/presentation/shared/components/EmptyState';

interface ProductGridProps {
  items: ProductCardData[];
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="w-full aspect-[3/4]" />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
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
        className="px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        style={{ paddingTop: '2rem', paddingBottom: '2rem', columnGap: '0.5rem', rowGap: '1.25rem' }}
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
      className="px-4 md:px-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 transition-opacity duration-300"
      style={{ padding: '2rem 1rem', columnGap: '0.5rem', rowGap: '1.25rem', opacity: visible ? 1 : 0 }}
    >
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
