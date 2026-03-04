'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FiBookmark, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  /** Domain category ID — used for client-side filtering */
  categoryId?: number;
  price: number;
  salePrice?: number;
  images: string[];
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const hasMany = product.images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i - 1 + product.images.length) % product.images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i + 1) % product.images.length);
  };

  const formattedPrice = `৳${product.price.toFixed(2)}`;
  const formattedSalePrice = product.salePrice ? `৳${product.salePrice.toFixed(2)}` : null;

  return (
    <Card className="overflow-hidden group">
      {/* Image area */}
      <CardContent className="p-4 relative">
        <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
          {/* Sliding strip */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ width: `${product.images.length * 100}%`, transform: `translateX(-${(imgIndex / product.images.length) * 100}%)` }}
          >
            {product.images.map((src, i) => (
              <div key={i} className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / product.images.length}%` }}>
                <Image
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>

          {/* Slide arrows — only when multiple images */}
          {hasMany && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <FiChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {hasMany && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {product.images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: i === imgIndex ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: i === imgIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>
          )}
        </Link>

        {/* Wishlist */}
        <button
          className="absolute top-6 right-6 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow transition-opacity opacity-0 group-hover:opacity-100 z-10"
          onClick={() => setWishlisted((v) => !v)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <FiBookmark size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </CardContent>

      {/* Info */}
      <CardFooter className="flex flex-col items-start gap-1.5 px-4 pb-4 pt-0" style={{padding:'1rem'}}>
        <div className="flex items-start justify-between w-full gap-2">
          <Link href={`/products/${product.slug}`} className="flex-1">
            <p className="text-sm font-semibold leading-snug hover:underline underline-offset-2">
              {product.name}
            </p>
          </Link>
          <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5" style={{paddingLeft:'1rem',paddingRight:'1rem',paddingTop:'0.5rem',paddingBottom:'0.5rem'}}>
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {formattedSalePrice ? (
            <>
              <span className="text-sm font-medium" style={{ color: 'var(--brand-gold)' }}>{formattedSalePrice}</span>
              <span className="text-sm text-muted-foreground line-through">{formattedPrice}</span>
            </>
          ) : (
            <span className="text-sm font-medium">{formattedPrice}</span>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-1" asChild>
          <Link href={`/products/${product.slug}`}>Add to Cart</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
