import type { PromoDto } from '@/shared/types/api.types';

export type { PromoDto };

export interface CreatePromoPayload {
  code:              string;
  discountType:      'percentage' | 'flat';
  discountValue:     number;
  minimumOrderValue?: number;
  maximumDiscount?:  number;
  maxTotalUses?:     number;
  maxUsesPerUser?:   number;
  startsAt?:         string;
  expiresAt?:        string;
  isActive?:         boolean;
}

export type UpdatePromoPayload = Partial<CreatePromoPayload>;
