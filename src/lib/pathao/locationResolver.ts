/**
 * Location Name Resolver
 * Fast, in-memory resolution of location IDs to names
 * Used during CSV generation
 */
import type { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

export class LocationNameResolver {
  private cityMap = new Map<number, string>();
  private zoneMap = new Map<string, string>(); // key: "cityId-zoneId"
  private areaMap = new Map<string, string>(); // key: "cityId-zoneId-areaId"

  /**
   * Load all location data from Convex into memory
   * Called once before CSV generation
   */
  async loadFromConvex(convexClient: ConvexHttpClient): Promise<void> {
    const locations = await convexClient.query(api.locations_queries.getAllLocations);

    // Populate maps for O(1) lookup
    for (const loc of locations) {
      if (loc.type === 'city') {
        this.cityMap.set(loc.cityId, loc.name);
      } else if (loc.type === 'zone' && loc.zoneId !== undefined) {
        const key = `${loc.cityId}-${loc.zoneId}`;
        this.zoneMap.set(key, loc.name);
      } else if (
        loc.type === 'area' &&
        loc.zoneId !== undefined &&
        loc.areaId !== undefined
      ) {
        const key = `${loc.cityId}-${loc.zoneId}-${loc.areaId}`;
        this.areaMap.set(key, loc.name);
      }
    }

    console.log(
      `[LocationResolver] Loaded ${this.cityMap.size} cities, ${this.zoneMap.size} zones, ${this.areaMap.size} areas`
    );
  }

  /**
   * Resolve city name from ID
   * Falls back to provided fallback if not found
   */
  resolveCityName(
    cityId: number | null | undefined,
    fallback: string
  ): string {
    if (!cityId) return fallback;
    return this.cityMap.get(cityId) ?? fallback;
  }

  /**
   * Resolve zone name from city+zone IDs
   * Falls back to provided fallback if not found
   */
  resolveZoneName(
    cityId: number | null | undefined,
    zoneId: number | null | undefined,
    fallback: string
  ): string {
    if (!cityId || !zoneId) return fallback;
    const key = `${cityId}-${zoneId}`;
    return this.zoneMap.get(key) ?? fallback;
  }

  /**
   * Resolve area name from city+zone+area IDs
   * Falls back to provided fallback if not found
   */
  resolveAreaName(
    cityId: number | null | undefined,
    zoneId: number | null | undefined,
    areaId: number | null | undefined,
    fallback: string
  ): string {
    if (!cityId || !zoneId || !areaId) return fallback;
    const key = `${cityId}-${zoneId}-${areaId}`;
    return this.areaMap.get(key) ?? fallback;
  }

  /**
   * Get stats (for debugging)
   */
  getStats(): { cities: number; zones: number; areas: number } {
    return {
      cities: this.cityMap.size,
      zones: this.zoneMap.size,
      areas: this.areaMap.size,
    };
  }
}
