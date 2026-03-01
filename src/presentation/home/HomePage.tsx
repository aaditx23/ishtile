'use client';

import { useMemo, useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import SiteHeader from './components/SiteHeader';
import HeroBanner from './components/HeroBanner';
import CountdownBanner from './components/CountdownBanner';
import CategorySelector, { type Category } from './components/CategorySelector';
import SectionHeader from './components/SectionHeader';
import ProductGrid from './components/ProductGrid';
import SiteFooter from './components/SiteFooter';
import type { ProductCardData } from './components/ProductCard';

// ── Product data ──────────────────────────────────────────────────────────────
const PLACEHOLDER_PRODUCTS: ProductCardData[] = [
  {
    id: '1',
    slug: 'trouser-black',
    name: 'Classic Black Trouser',
    category: 'Men',
    price: 1800,
    images: [
      '/images/products/trouser_black_01.jpg',
      '/images/products/trouser_black_02.jpg',
      '/images/products/trouser_black_03.jpg',
    ],
  },
  {
    id: '2',
    slug: 'trouser-green',
    name: 'Olive Green Trouser',
    category: 'Men',
    price: 1800,
    salePrice: 1500,
    images: [
      '/images/products/trouser_green_01.jpg',
      '/images/products/trouser_green_02.jpg',
    ],
  },
  {
    id: '3',
    slug: 'trouser-khaki',
    name: 'Khaki Trouser',
    category: 'Men',
    price: 1800,
    images: [
      '/images/products/trouser_khaki_01.jpg',
      '/images/products/trouser_khaki_02.jpg',
    ],
  },
  {
    id: '4',
    slug: 'tshirt-puma',
    name: 'PUMA Graphic Tee',
    category: 'Men',
    price: 1200,
    images: [
      '/images/products/tshirt_puma_01.png',
    ],
  },
];

const SECTION_TITLES: Record<Category, string> = {
  All:    'All New Arrivals',
  Men:    "Men's New Arrivals",
  Women:  "Women's New Arrivals",
  Unisex: 'Unisex New Arrivals',
};

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Men');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return PLACEHOLDER_PRODUCTS;
    return PLACEHOLDER_PRODUCTS.filter((p) => p.category === selectedCategory);
  }, [selectedCategory]);

  const viewAllHref = `/collections/${selectedCategory.toLowerCase()}`;

  return (
    <>
      <AnnouncementBar text="" />
      <SiteHeader />

      <main>
        <HeroBanner />
        <CountdownBanner targetDate={null} />

        <section>
          <CategorySelector
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <SectionHeader
            title={SECTION_TITLES[selectedCategory]}
            viewAllHref={viewAllHref}
          />
          <ProductGrid
            key={selectedCategory}
            items={filteredProducts}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
