import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  PathaoCityDto,
  PathaoZoneDto,
  PathaoAreaDto,
  GetCitiesResponse,
  GetZonesResponse,
  GetAreasResponse,
} from '@/shared/types/api.types';

export class LocationApiRepository {
  async getCities(): Promise<PathaoCityDto[]> {
    const res = await apiClient.get<GetCitiesResponse>(ENDPOINTS.locations.cities);
    return (res.listData ?? []) as PathaoCityDto[];
  }

  async getZones(cityId: number): Promise<PathaoZoneDto[]> {
    const res = await apiClient.get<GetZonesResponse>(ENDPOINTS.locations.zones(cityId));
    return (res.listData ?? []) as PathaoZoneDto[];
  }

  async getAreas(zoneId: number): Promise<PathaoAreaDto[]> {
    const res = await apiClient.get<GetAreasResponse>(ENDPOINTS.locations.areas(zoneId));
    return (res.listData ?? []) as PathaoAreaDto[];
  }
}
