import { convex } from './convexClient';
import { asId, fromId, buildPagination } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type { FavouriteDto, Pagination } from '@/shared/types/api.types';

export interface PaginatedFavourites {
  items: FavouriteDto[];
  pagination: Pagination;
}

export class FavouriteConvexRepository {
  async list(page = 1, pageSize = 20): Promise<PaginatedFavourites> {
    const userId = requireConvexUserId();
    const res = await convex.query(api.favourites.queries.listFavourites, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:   userId as any,
      page,
      pageSize,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: FavouriteDto[] = res.items.map((f: any) => ({
      id:          asId(f.id),
      userId:      asId(f.userId),
      productId:   asId(f.productId),
      productName: f.productName ?? '',
      productSlug: f.productSlug ?? '',
      basePrice:   f.basePrice ?? 0,
      imageUrl:    f.imageUrl ?? null,
      isActive:    f.isActive ?? true,
      createdAt:   typeof f.createdAt === 'number' ? new Date(f.createdAt).toISOString() : f.createdAt,
    }));

    return {
      items,
      pagination: buildPagination(res.total, res.page, res.pageSize),
    };
  }

  async checkFavourite(productId: number): Promise<number | null> {
    const userId = requireConvexUserId();
    const res = await convex.query(api.favourites.queries.getFavouriteByProduct, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productId: fromId(productId) as any,
    });
    return res ? asId(res.id) : null;
  }

  async add(productId: number): Promise<number> {
    const userId = requireConvexUserId();
    const res = await convex.mutation(api.favourites.mutations.addFavourite, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productId: fromId(productId) as any,
    });
    return asId(res.id);
  }

  async remove(favouriteId: number): Promise<void> {
    const userId = requireConvexUserId();
    await convex.mutation(api.favourites.mutations.removeFavourite, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      favouriteId: fromId(favouriteId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:      userId as any,
    });
  }

  async toggle(productId: number): Promise<{ added: boolean; favouriteId: number | null }> {
    const userId = requireConvexUserId();
    const res = await convex.mutation(api.favourites.mutations.toggleFavourite, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productId: fromId(productId) as any,
    });
    return {
      added: res.action === 'added',
      favouriteId: res.id ? asId(res.id) : null,
    };
  }
}
