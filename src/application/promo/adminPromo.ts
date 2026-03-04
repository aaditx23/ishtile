import { adminPromoRepository } from '@/lib/di';
import type { PromoDto, CreatePromoPayload, UpdatePromoPayload } from '@/domain/promo/promo.entity';
import type { PaginatedPromos } from '@/infrastructure/api/adminPromoApi.repository';

export async function getPromos(page = 1, pageSize = 20): Promise<PaginatedPromos> {
  return adminPromoRepository.list(page, pageSize);
}

export async function createPromo(payload: CreatePromoPayload): Promise<PromoDto> {
  return adminPromoRepository.create(payload);
}

export async function updatePromo(id: number, payload: UpdatePromoPayload): Promise<PromoDto> {
  return adminPromoRepository.update(id, payload);
}

export async function deletePromo(id: number): Promise<void> {
  return adminPromoRepository.delete(id);
}
