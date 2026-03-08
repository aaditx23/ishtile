import HeroBanner from './components/HeroBanner';
import CountdownBanner from './components/CountdownBanner';
import HomeProductSection from './components/HomeProductSection';
import MobileHomePage from './MobileHomePage';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';

interface HomePageProps {
  products: ProductCardData[];
  categories: Category[];
  countdownTarget?: string | null;
}

export default function HomePage({ products, categories, countdownTarget = null }: HomePageProps) {
  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileHomePage products={products} categories={categories} countdownTarget={countdownTarget} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <HeroBanner />
        <CountdownBanner targetDate={countdownTarget} />
        <HomeProductSection products={products} categories={categories} />
      </div>
    </ShopLayout>
  );
}
