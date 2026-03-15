import HeroBanner from './components/HeroBanner';
import HomeProductSection from './components/HomeProductSection';
import HomeBrandSection from './components/HomeBrandSection';
import CategoryExploreBlock from './components/CategoryExploreBlock';
import LookbookSection from './components/LookbookSection';
import MobileHomePage from './MobileHomePage';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';
import type { HeroImageData } from '@/application/home/getActiveHeroImages';

interface HomePageProps {
  products: ProductCardData[];
  trendingProducts: ProductCardData[];
  categories: Category[];
  brands: Brand[];
  heroImages: HeroImageData[];
  lookbooks: Lookbook[];
}

export default function HomePage({ products, trendingProducts, categories, brands, heroImages, lookbooks }: HomePageProps) {
  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileHomePage products={products} trendingProducts={trendingProducts} categories={categories} brands={brands} heroImages={heroImages} lookbooks={lookbooks} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <HeroBanner heroImages={heroImages} />
        <HomeProductSection products={products} />
        <CategoryExploreBlock categories={categories} />
        <HomeProductSection products={trendingProducts} title="Trending Products" />
        <LookbookSection lookbooks={lookbooks} />
        <HomeBrandSection brands={brands} />
      </div>
    </ShopLayout>
  );
}
