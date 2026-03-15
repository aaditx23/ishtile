/**
 * Dependency injection container.
 *
 * Instantiates repository implementations once and exports them as
 * named singletons. Import from here anywhere (application layer,
 * server actions, client hooks) instead of importing concrete classes directly.
 *
 * All repositories now use the Convex backend, except:
 *   - locationRepository — Pathao API (no Convex equivalent)
 */

import { CategoryConvexRepository } from '@/infrastructure/convex/categoryConvex.repository';
import { ProductConvexRepository } from '@/infrastructure/convex/productConvex.repository';
import { CartConvexRepository } from '@/infrastructure/convex/cartConvex.repository';
import { OrderConvexRepository } from '@/infrastructure/convex/orderConvex.repository';
import { UserConvexRepository } from '@/infrastructure/convex/userConvex.repository';
import { FavouriteConvexRepository } from '@/infrastructure/convex/favouriteConvex.repository';
import { PromoConvexRepository } from '@/infrastructure/convex/promoConvex.repository';
import { AnalyticsConvexRepository } from '@/infrastructure/convex/analyticsConvex.repository';
import { AdminOrderConvexRepository } from '@/infrastructure/convex/adminOrderConvex.repository';
import { AdminProductConvexRepository } from '@/infrastructure/convex/adminProductConvex.repository';
import { AdminPromoConvexRepository } from '@/infrastructure/convex/adminPromoConvex.repository';
import { AdminCategoryConvexRepository } from '@/infrastructure/convex/adminCategoryConvex.repository';
import { UserAddressConvexRepository } from '@/infrastructure/convex/userAddressConvex.repository';
import { LookbookConvexRepository } from '@/infrastructure/convex/lookbookConvex.repository';
import { LocationApiRepository } from '@/infrastructure/api/locationApi.repository';

export const categoryRepository = new CategoryConvexRepository();
export const productRepository = new ProductConvexRepository();
export const cartRepository = new CartConvexRepository();
export const orderRepository = new OrderConvexRepository();
export const userRepository = new UserConvexRepository();
export const favouriteRepository = new FavouriteConvexRepository();
export const promoRepository = new PromoConvexRepository();
export const analyticsRepository = new AnalyticsConvexRepository();
export const adminOrderRepository = new AdminOrderConvexRepository();
export const adminProductRepository = new AdminProductConvexRepository();
export const adminPromoRepository = new AdminPromoConvexRepository();
export const adminCategoryRepository = new AdminCategoryConvexRepository();
export const locationRepository = new LocationApiRepository(); // Pathao — stays as API
export const addressRepository = new UserAddressConvexRepository();
export const lookbookRepository = new LookbookConvexRepository();
