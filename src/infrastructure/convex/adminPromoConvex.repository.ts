import { convex } from './convexClient';
import { asId, fromId, buildPagination } from './convexHelpers';
import { requireConvexUserId } from './convexAuth';
import { api } from '../../../convex/_generated/api';
import type { PromoDto } from '@/shared/types/api.types';
import type { CreatePromoPayload, UpdatePromoPayload } from '@/domain/promo/promo.entity';

export interface PaginatedPromos {
  items: PromoDto[];
  pagination: ReturnType<typeof buildPagination>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPromo(p: any): PromoDto {
  return {
    id: asId(p._id),
    code: p.code,
    discountType: p.discountType,
    discountValue: p.discountValue,
    minimumOrderValue: p.minimumOrderValue ?? null,
    maximumDiscount: p.maximumDiscount ?? null,
    maxTotalUses: p.maxTotalUses ?? null,
    maxUsesPerUser: p.maxUsesPerUser ?? null,
    currentUses: p.currentUses ?? 0,
    startsAt: p.startsAt ? new Date(p.startsAt).toISOString() : null,
    expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString() : null,
    isActive: p.isActive,
    createdAt: p._creationTime ? new Date(p._creationTime).toISOString() : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export class AdminPromoConvexRepository {
  async list(page = 1, pageSize = 20): Promise<PaginatedPromos> {
    const res = await convex.query(api.promos.queries.listPromos, { page, pageSize });
    return {
      items: res.items.map(mapPromo),
      pagination: buildPagination(res.total, res.page, res.pageSize),
    };
  }

  async create(payload: CreatePromoPayload): Promise<PromoDto> {
    const adminUserId = requireConvexUserId();
    const promoId = await convex.mutation(api.promos.mutations.createPromo, {
      code: payload.code,
      discountType: payload.discountType as 'flat' | 'percentage',
      discountValue: payload.discountValue,
      minimumOrderValue: payload.minimumOrderValue,
      maximumDiscount: payload.maximumDiscount,
      maxTotalUses: payload.maxTotalUses,
      maxUsesPerUser: payload.maxUsesPerUser,
      startsAt: payload.startsAt ? new Date(payload.startsAt).getTime() : undefined,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt).getTime() : undefined,
      isActive: payload.isActive,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
    // Fetch by code to return
    const promo = await convex.query(api.promos.queries.getPromoByCode, {
      code: payload.code.trim().toUpperCase(),
    });
    if (!promo) throw new Error('Promo not found after creation');
    return mapPromo({ ...promo, _id: promoId });
  }

  async update(id: number, payload: UpdatePromoPayload): Promise<PromoDto> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.promos.mutations.updatePromo, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      promoId: fromId(id) as any,
      code: payload.code,
      discountType: payload.discountType as 'flat' | 'percentage' | undefined,
      discountValue: payload.discountValue,
      minimumOrderValue: payload.minimumOrderValue,
      maximumDiscount: payload.maximumDiscount,
      maxTotalUses: payload.maxTotalUses,
      maxUsesPerUser: payload.maxUsesPerUser,
      startsAt: payload.startsAt ? new Date(payload.startsAt).getTime() : undefined,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt).getTime() : undefined,
      isActive: payload.isActive,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
    // Re-fetch updated promo
    const list = await convex.query(api.promos.queries.listPromos, { page: 1, pageSize: 9999 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = list.items.find((p: any) => p._id === fromId(id));
    if (!found) throw new Error('Promo not found after update');
    return mapPromo(found);
  }

  async delete(id: number): Promise<void> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.promos.mutations.deletePromo, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      promoId: fromId(id) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
  }
}
