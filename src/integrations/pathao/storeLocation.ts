/**
 * Store location auto-detection for Pathao.
 *
 * Uses city / zone / area list APIs to infer the
 * store's city_id, zone_id, and area_id from the
 * configured PATHAO_STORE_ADDRESS.
 *
 * Fallback rules:
 *   1. If PATHAO_STORE_CITY_ID / ZONE_ID / AREA_ID are
 *      all valid (>0), they are returned as-is.
 *   2. Otherwise, detect from address and cache
 *      the result in-memory for the life of the process.
 */

import { getCityList, getZoneList, getAreaList } from './orders';

interface StoreLocation {
  cityId: number;
  zoneId: number;
  areaId: number;
}

let cachedLocation: StoreLocation | null = null;

function haveValidEnvLocation(): StoreLocation | null {
  const cityId = Number(process.env.PATHAO_STORE_CITY_ID ?? 0);
  const zoneId = Number(process.env.PATHAO_STORE_ZONE_ID ?? 0);
  const areaId = Number(process.env.PATHAO_STORE_AREA_ID ?? 0);

  if (cityId > 0 && zoneId > 0 && areaId > 0) {
    return { cityId, zoneId, areaId };
  }
  return null;
}

export async function getStoreLocation(): Promise<StoreLocation> {
  // 1. Prefer explicit env configuration if valid
  const fromEnv = haveValidEnvLocation();
  if (fromEnv) return fromEnv;

  // 2. In-memory cache
  if (cachedLocation) return cachedLocation;

  const address = (process.env.PATHAO_STORE_ADDRESS ?? '').toLowerCase();

  // ── City detection ────────────────────────────────────────────────────────
  const cities = await getCityList();

  let city = cities.find((c) => address.includes(c.name.toLowerCase()));
  if (!city) {
    const words = address.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
    city = cities.find((c) =>
      words.some((w) => c.name.toLowerCase().includes(w)),
    ) ?? cities[0];
  }

  if (!city) {
    cachedLocation = { cityId: 1, zoneId: 1, areaId: 1 };
    return cachedLocation;
  }

  // ── Zone detection ────────────────────────────────────────────────────────
  const zones = await getZoneList(city.id);
  const words = address.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  let zone = zones.find((z) =>
    words.some((w) => z.name.toLowerCase().includes(w)),
  );

  if (!zone) {
    // Fallback: first zone in the city
    zone = zones[0];
  }

  if (!zone) {
    cachedLocation = { cityId: city.id, zoneId: 1, areaId: 1 };
    return cachedLocation;
  }

  // ── Area detection ────────────────────────────────────────────────────────
  const areas = await getAreaList(zone.id);
  const areaWords = address.split(/[^a-z0-9]+/).filter((w) => w.length > 2);

  let area = areas.find((a) =>
    areaWords.some((w) => a.name.toLowerCase().includes(w)),
  );

  if (!area) {
    // As a very last resort, pick the first area in the zone
    area = areas[0];
  }

  cachedLocation = {
    cityId: city.id,
    zoneId: zone.id,
    areaId: area ? area.id : 1,
  };

  return cachedLocation;
}
