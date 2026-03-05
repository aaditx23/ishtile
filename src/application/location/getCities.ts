import { locationRepository } from '@/lib/di';
import type { PathaoCityDto } from '@/shared/types/api.types';

export async function getCities(): Promise<PathaoCityDto[]> {
  return locationRepository.getCities();
}
