import { convex } from './convexClient';
import { requireConvexUserId } from './convexAuth';
import { api } from '../../../convex/_generated/api';
import type { PromoValidationDto } from '@/shared/types/api.types';

export class PromoConvexRepository {
  async validate(promoCode: string, orderValue: number): Promise<PromoValidationDto> {
    const userId = requireConvexUserId();
    const res = await convex.query(api.promos.queries.validatePromo, {
      promoCode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:     userId as any,
      orderValue,
    });

    return {
      isValid:        res.isValid,
      discountAmount: res.discount ?? 0,
      message:        res.message ?? '',
    };
  }
}
