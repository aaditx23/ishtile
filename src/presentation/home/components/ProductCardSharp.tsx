'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FavouriteButton from '@/presentation/products/[slug]/components/FavouriteButton';

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  category: string;
  categoryId?: number;
  brandId?: number | null;
  price: number;
  salePrice?: number;
  images: string[];
}

function isValidUrl(src: string) {
  try { new URL(src); return true; } catch { return false; }
}

export default function ProductCardSharp({ product }: { product: ProductCardData }) {
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
    <div className="overflow-hidden group border border-input bg-surface transition-shadow hover:shadow-md">
      {/* Image area */}
      <div className="relative" style={{ lineHeight: 0 }}>
        <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-product-bg leading-none">
          {/* Sliding strip */}
          <div
            className="absolute top-0 left-0 h-full flex transition-transform duration-300 ease-in-out"
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

          {/* Slide arrows */}
          {hasMany && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/70 hover:bg-surface rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} className="text-gray-800" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/70 hover:bg-surface rounded-full w-7 h-7 flex items-center justify-center shadow transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10"
                aria-label="Next image"
              >
                <ChevronRight size={16} className="text-gray-800" />
              </button>
            </>
          )}

          {/* Rectangle indicators (sharp corners) */}
          {hasMany && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {validImages.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: i === imgIndex ? '20px' : '6px',
                    height: '6px',
                    backgroundColor: i === imgIndex ? 'var(--surface)' : 'color-mix(in srgb, var(--surface) 50%, transparent)',
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>
          )}
        </Link>

        {/* Favourite - sharp bookmark style */}
        <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <FavouriteButton productId={product.id} compact />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col items-start gap-2 p-3 sm:p-4">
        {/* Name */}
        <Link href={`/products/${product.slug}`} className="w-full">
          <h3 className="text-sm sm:text-base font-medium leading-tight hover:underline underline-offset-2 line-clamp-2 text-neutral-900">
            {product.name}
          </h3>
        </Link>

        {/* Category badge - sharp corners */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs px-2 py-1 bg-surface-variant text-on-surface-muted border border-input">
            {product.category}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 w-full">
          {formattedSalePrice ? (
            <>
              <span className="text-sm sm:text-base font-semibold text-neutral-900">{formattedPrice}</span>
              <span className="text-xs text-neutral-500 line-through">{formattedSalePrice}</span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-semibold text-neutral-900">{formattedPrice}</span>
          )}
        </div>

        {/* View button - sharp corners, minimal style */}
        <Link 
          href={`/products/${product.slug}`}
          className="w-full text-center text-xs sm:text-sm font-medium py-2 border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-on-primary transition-colors"
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  );
}
