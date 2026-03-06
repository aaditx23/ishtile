'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FavouriteButton from '@/presentation/products/[slug]/components/FavouriteButton';

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

function isValidUrl(src: string) {
  try { new URL(src); return true; } catch { return false; }
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const validImages = product.images.filter(isValidUrl);
  const [imgIndex, setImgIndex] = useState(0);
  const hasMany = validImages.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i - 1 + validImages.length) % validImages.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i + 1) % validImages.length);
  };

  const formattedPrice = `৳${Number(product.price || 0).toFixed(2)}`;
  const formattedSalePrice = product.salePrice ? `৳${Number(product.salePrice).toFixed(2)}` : null;

  return (
    <Card className="overflow-hidden group" >
      {/* Image area */}
      <CardContent className="relative">
        <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-sm bg-neutral-100">
          {/* Sliding strip */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ width: `${validImages.length * 100}%`, transform: `translateX(-${(imgIndex / validImages.length) * 100}%)` }}
          >
            {validImages.map((src, i) => (
              <div key={i} className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / validImages.length}%` }}>
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} className="text-gray-800" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight size={16} className="text-gray-800" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {hasMany && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {validImages.map((_, i) => (
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

        {/* Favourite */}
        <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <FavouriteButton productId={Number(product.id)} compact />
        </div>
      </CardContent>

      {/* Info */}
      <CardFooter className="flex flex-col items-start gap-1 sm:gap-1.5 p-2 sm:p-4" style={{padding:'1rem'}}>
        {/* Name + category badge in one row */}
        <div className="flex items-start justify-between w-full gap-1.5" style={{alignContent:'center'}}>
          <Link href={`/products/${product.slug}`} className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold leading-snug hover:underline underline-offset-2 line-clamp-2">
              {product.name}
            </p>
          </Link>
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs px-2 py-0.5 shrink-0" style={{padding:'0.25rem'}}>
            {product.category}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          {formattedSalePrice ? (
            <>
              <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--brand-gold)' }}>{formattedSalePrice}</span>
              <span className="text-xs text-muted-foreground line-through">{formattedPrice}</span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-medium">{formattedPrice}</span>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full mt-1 text-xs sm:text-sm h-7 sm:h-9" asChild>
          <Link href={`/products/${product.slug}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
