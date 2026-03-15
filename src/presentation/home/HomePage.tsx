import HeroBanner from './components/HeroBanner';
import HomeProductSection from './components/HomeProductSection';
import HomeBrandSection from './components/HomeBrandSection';
import CategoryExploreBlock from './components/CategoryExploreBlock';
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
}

export default function HomePage({ products, categories, brands, heroImages }: HomePageProps) {
  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileHomePage products={products} categories={categories} brands={brands} heroImages={heroImages} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <HeroBanner heroImages={heroImages} />
        <HomeProductSection products={products} />
        <CategoryExploreBlock categories={categories} />
        <HomeBrandSection brands={brands} />
      </div>
    </ShopLayout>
  );
}
