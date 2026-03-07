import { promoRepository } from '@/lib/di';
import type { PromoValidationDto } from '@/shared/types/api.types';

export async function validatePromo(
  promoCode: string,
  orderValue: number,
): Promise<PromoValidationDto> {
  return promoRepository.validate(promoCode, orderValue);
}
