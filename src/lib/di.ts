/**
 * Dependency injection container.
 *
 * Instantiates repository implementations once and exports them as
 * named singletons. Import from here anywhere (application layer,
 * server actions, client hooks) instead of importing concrete classes directly.
 */

import { CategoryApiRepository } from '@/infrastructure/api/categoryApi.repository';
import { ProductApiRepository } from '@/infrastructure/api/productApi.repository';
import { CartApiRepository } from '@/infrastructure/api/cartApi.repository';
import { OrderApiRepository } from '@/infrastructure/api/orderApi.repository';
import { UserApiRepository } from '@/infrastructure/api/userApi.repository';
import { FavouriteApiRepository } from '@/infrastructure/api/favouriteApi.repository';
import { PromoApiRepository } from '@/infrastructure/api/promoApi.repository';
import { AnalyticsApiRepository } from '@/infrastructure/api/analyticsApi.repository';
import { AdminOrderApiRepository } from '@/infrastructure/api/adminOrderApi.repository';
import { AdminProductApiRepository } from '@/infrastructure/api/adminProductApi.repository';
import { AdminPromoApiRepository } from '@/infrastructure/api/adminPromoApi.repository';
import { AdminCategoryApiRepository } from '@/infrastructure/api/adminCategoryApi.repository';
import { LocationApiRepository } from '@/infrastructure/api/locationApi.repository';
import { UserAddressApiRepository } from '@/infrastructure/api/userAddressApi.repository';

export const categoryRepository = new CategoryApiRepository();
export const productRepository = new ProductApiRepository();
export const cartRepository = new CartApiRepository();
export const orderRepository = new OrderApiRepository();
export const userRepository = new UserApiRepository();
export const favouriteRepository = new FavouriteApiRepository();
export const promoRepository = new PromoApiRepository();
export const analyticsRepository = new AnalyticsApiRepository();
export const adminOrderRepository = new AdminOrderApiRepository();
export const adminProductRepository = new AdminProductApiRepository();
export const adminPromoRepository = new AdminPromoApiRepository();
export const adminCategoryRepository = new AdminCategoryApiRepository();
export const locationRepository = new LocationApiRepository();
export const addressRepository = new UserAddressApiRepository();
