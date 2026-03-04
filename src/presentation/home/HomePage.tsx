import HeroBanner from './components/HeroBanner';
import CountdownBanner from './components/CountdownBanner';
import HomeProductSection from './components/HomeProductSection';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import type { ProductCardData } from './components/ProductCard';
import type { Category } from '@/domain/category/category.entity';

interface HomePageProps {
  products: ProductCardData[];
  categories: Category[];
  /** ISO-8601 string — Date objects can't be serialized across the server/client boundary. Pass null to hide the countdown. */
  countdownTarget?: string | null;
}

/**
 * Server component shell — receives pre-fetched data as props.
 * Interactive filtering is handled by the HomeProductSection client island.
 */
export default function HomePage({ products, categories, countdownTarget = null }: HomePageProps) {
  return (
    <ShopLayout announcement="FREE SHIPPING ON ALL ORDERS OVER ৳2500 — SHOP NOW">
      <HeroBanner />
      <CountdownBanner targetDate={countdownTarget} />
      <HomeProductSection products={products} categories={categories} />
    </ShopLayout>
  );
}
