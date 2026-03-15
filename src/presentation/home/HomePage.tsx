import HeroBanner from './components/HeroBanner';
import CountdownBanner from './components/CountdownBanner';
import HomeProductSection from './components/HomeProductSection';
import HomeBrandSection from './components/HomeBrandSection';
import MobileHomePage from './MobileHomePage';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { HeroImageData } from '@/application/home/getActiveHeroImages';

interface HomePageProps {
  products: ProductCardData[];
  categories: Category[];
  brands: Brand[];
  heroImages: HeroImageData[];
  countdownTarget?: string | null;
}

export default function HomePage({ products, categories, brands, heroImages, countdownTarget = null }: HomePageProps) {
  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileHomePage products={products} categories={categories} brands={brands} heroImages={heroImages} countdownTarget={countdownTarget} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <HeroBanner heroImages={heroImages} />
        <CountdownBanner targetDate={countdownTarget} />
        <HomeProductSection products={products} categories={categories} />
        <HomeBrandSection products={products} brands={brands} />
      </div>
    </ShopLayout>
  );
}
