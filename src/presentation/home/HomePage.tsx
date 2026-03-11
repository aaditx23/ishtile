import HeroBanner from './components/HeroBanner';
import CountdownBanner from './components/CountdownBanner';
import HomeProductSection from './components/HomeProductSection';
import HomeBrandSection from './components/HomeBrandSection';
import MobileHomePage from './MobileHomePage';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';

interface HomePageProps {
  products: ProductCardData[];
  categories: Category[];
  brands: Brand[];
  countdownTarget?: string | null;
}

export default function HomePage({ products, categories, brands, countdownTarget = null }: HomePageProps) {
  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileHomePage products={products} categories={categories} brands={brands} countdownTarget={countdownTarget} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <HeroBanner />
        <CountdownBanner targetDate={countdownTarget} />
        <HomeProductSection products={products} categories={categories} />
        <HomeBrandSection products={products} brands={brands} />
      </div>
    </ShopLayout>
  );
}
