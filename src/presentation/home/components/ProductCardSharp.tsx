'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FavouriteButton from '@/presentation/products/[slug]/components/FavouriteButton';
import QuickAddDialog from './QuickAddDialog';

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
  const images = validImages.length > 0 ? validImages : ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80'];
  const [imgIndex, setImgIndex] = useState(0);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const hasMany = images.length > 1;

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    setImgIndex((i) => (i + 1) % images.length);
  };

  const formattedPrice = `৳${Number(product.salePrice ?? product.price ?? 0).toFixed(0)}`;
  const formattedComparePrice = product.salePrice ? `৳${Number(product.price).toFixed(0)}` : null;

  return (
    <article className="overflow-hidden group bg-surface" style={{ border: '1px solid var(--brand-dark)' }}>
      {/* Image area */}
      <div className="relative" style={{ lineHeight: 0 }}>
        <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-product-bg leading-none">
          {/* Sliding strip */}
          <div
            className="absolute top-0 left-0 h-full flex transition-transform duration-300 ease-in-out"
            style={{ width: `${images.length * 100}%`, transform: `translateX(-${(imgIndex / images.length) * 100}%)` }}
          >
            {images.map((src, i) => (
              <div key={i} className="relative h-full flex-shrink-0 overflow-hidden" style={{ width: `${100 / images.length}%` }}>
                <Image
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 52vw, (max-width: 1280px) 31vw, 23vw"
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
              {images.map((_, i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: i === imgIndex ? '18px' : '5px',
                    height: '5px',
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
      <div className="flex flex-col items-start gap-2 p-3">
        <Link href={`/products/${product.slug}`} className="w-full">
          <h3 className="text-sm font-medium leading-tight line-clamp-2 text-on-surface">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2">
            {formattedComparePrice ? (
              <>
                <span className="text-sm font-semibold text-on-surface">{formattedPrice}</span>
                <span className="text-xs text-on-surface-muted line-through">{formattedComparePrice}</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-on-surface">{formattedPrice}</span>
            )}
          </div>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="text-xs font-semibold uppercase tracking-[0.08em] underline underline-offset-2 text-on-surface cursor-pointer"
          >
            + Add
          </button>
        </div>

        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] uppercase tracking-[0.08em] text-on-surface-muted">{product.category}</span>
          <Link
            href={`/products/${product.slug}`}
            className="text-[10px] uppercase tracking-[0.08em] text-on-surface-muted hover:text-on-surface underline underline-offset-2 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
      <QuickAddDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        productId={product.id}
        productName={product.name}
        productSlug={product.slug}
      />
    </article>
  );
}
