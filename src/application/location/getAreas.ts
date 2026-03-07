import { locationRepository } from '@/lib/di';
import type { PathaoAreaDto } from '@/shared/types/api.types';

export async function getAreas(zoneId: number): Promise<PathaoAreaDto[]> {
  return locationRepository.getAreas(zoneId);
}
