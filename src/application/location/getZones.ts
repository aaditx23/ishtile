import { locationRepository } from '@/lib/di';
import type { PathaoZoneDto } from '@/shared/types/api.types';

export async function getZones(cityId: number): Promise<PathaoZoneDto[]> {
  return locationRepository.getZones(cityId);
}
