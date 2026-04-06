/**
 * Sync Pathao locations to local cache
 * Best-effort, non-blocking, safe
 */
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Type definitions
type SyncMeta = {
  lastSyncedAt: number;
} | null;

type PathaoCity = {
  city_id: number;
  city_name: string;
};

type PathaoZone = {
  zone_id: number;
  zone_name: string;
};

type PathaoArea = {
  area_id: number;
  area_name: string;
};

type SyncResult =
  | { skipped: true; reason: string; lastSyncedAt: number }
  | { success: true; syncedAt: number; duration: number; stats: { cities: number; zones: number; areas: number } }
  | { success: false; error: string };

// Pathao API configuration
const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL || "https://hermes-api.p-stageenv.xyz/api/v1";

/**
 * Get Pathao access token
 */
async function getPathaoToken(): Promise<string> {
  const response = await fetch(`${PATHAO_BASE_URL}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      grant_type: "password",
    }),
  });

  if (!response.ok) {
    throw new Error(`Token fetch failed: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch cities from Pathao
 */
async function fetchCities(token: string): Promise<any> {
  const response = await fetch(`${PATHAO_BASE_URL}/countries/1/city-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Cities fetch failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch zones for a city
 */
async function fetchZones(token: string, cityId: number): Promise<any> {
  const response = await fetch(`${PATHAO_BASE_URL}/cities/${cityId}/zone-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Zones fetch failed for city ${cityId}: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch areas for a zone
 */
async function fetchAreas(token: string, zoneId: number): Promise<any> {
  const response = await fetch(`${PATHAO_BASE_URL}/zones/${zoneId}/area-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Areas fetch failed for zone ${zoneId}: ${response.status}`);
  }

  return await response.json();
}

/**
 * Helper: Fetch with timeout
 */
function fetchWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Helper: Chunk array into batches
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sync action - lazy sync with 1-hour guard
 */
export default action({
  args: {
    forceSync: v.optional(v.boolean()),
  },
  handler: async (ctx, args: { forceSync?: boolean }): Promise<SyncResult> => {
    const { forceSync = false } = args;
    try {
      // 1. Check if sync needed (unless forced)
      if (!forceSync) {
        const meta: SyncMeta = await ctx.runQuery(internal.locations_queries.getSyncMeta);
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (meta && now - meta.lastSyncedAt < oneHour) {
          console.log("[Pathao Sync] Skipped - synced within last hour");
          return {
            skipped: true,
            reason: "Synced within last hour",
            lastSyncedAt: meta.lastSyncedAt,
          };
        }
      }

      console.log("[Pathao Sync] Starting...");
      const startTime = Date.now();

      // 2. Get Pathao access token
      const token = await fetchWithTimeout(() => getPathaoToken(), 10000);

      // 3. Fetch cities (with 10s timeout)
      console.log("[Pathao Sync] Fetching cities...");
      const citiesRes = await fetchWithTimeout(() => fetchCities(token), 10000);
      const cities: PathaoCity[] = citiesRes.data?.data || [];
      console.log(`[Pathao Sync] Fetched ${cities.length} cities`);

      // 4. Upsert cities
      if (cities.length > 0) {
        const cityLocations = cities.map((c) => ({
          type: "city" as const,
          cityId: c.city_id,
          name: c.city_name,
        }));

        const cityResult = await ctx.runMutation(
          internal.locations_mutations.batchUpsertLocations,
          { locations: cityLocations }
        );
        console.log(
          `[Pathao Sync] Cities: ${cityResult.inserted} inserted, ${cityResult.updated} updated`
        );
      }

      // 5. Fetch zones for each city (max 3 concurrent)
      console.log("[Pathao Sync] Fetching zones...");
      let totalZones = 0;
      const zoneBatches = chunk(cities, 3);
      const allZones: Array<{ cityId: number; zoneId: number }> = [];

      for (const batch of zoneBatches) {
        const zonesResults = await Promise.allSettled(
          batch.map((city) =>
            fetchWithTimeout(() => fetchZones(token, city.city_id), 10000)
          )
        );

        // Process fulfilled results
        const zonesToUpsert: any[] = [];
        zonesResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const zones: PathaoZone[] = result.value.data?.data || [];
            const cityId = batch[index].city_id;

            zones.forEach((z) => {
              zonesToUpsert.push({
                type: "zone" as const,
                cityId: cityId,
                zoneId: z.zone_id,
                name: z.zone_name,
              });

              allZones.push({ cityId, zoneId: z.zone_id });
            });

            totalZones += zones.length;
          } else {
            console.error(
              `[Pathao Sync] Failed to fetch zones for city ${batch[index].city_id}:`,
              result.reason
            );
          }
        });

        if (zonesToUpsert.length > 0) {
          await ctx.runMutation(
            internal.locations_mutations.batchUpsertLocations,
            { locations: zonesToUpsert }
          );
        }
      }
      console.log(`[Pathao Sync] Fetched ${totalZones} zones total`);

      // 6. Fetch areas for each zone (max 3 concurrent)
      console.log("[Pathao Sync] Fetching areas...");
      let totalAreas = 0;
      const areaBatches = chunk(allZones, 3);

      for (const batch of areaBatches) {
        const areasResults = await Promise.allSettled(
          batch.map((zone) =>
            fetchWithTimeout(() => fetchAreas(token, zone.zoneId), 10000)
          )
        );

        const areasToUpsert: any[] = [];
        areasResults.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const areas: PathaoArea[] = result.value.data?.data || [];
            const { cityId, zoneId } = batch[index];

            areas.forEach((a) => {
              areasToUpsert.push({
                type: "area" as const,
                cityId: cityId,
                zoneId: zoneId,
                areaId: a.area_id,
                name: a.area_name,
              });
            });

            totalAreas += areas.length;
          } else {
            console.error(
              `[Pathao Sync] Failed to fetch areas for zone ${batch[index].zoneId}:`,
              result.reason
            );
          }
        });

        if (areasToUpsert.length > 0) {
          await ctx.runMutation(
            internal.locations_mutations.batchUpsertLocations,
            { locations: areasToUpsert }
          );
        }
      }
      console.log(`[Pathao Sync] Fetched ${totalAreas} areas total`);

      // 7. Update sync timestamp
      const now = Date.now();
      await ctx.runMutation(internal.locations_mutations.updateSyncMeta, {
        lastSyncedAt: now,
      });

      const duration = Date.now() - startTime;
      console.log(`[Pathao Sync] Completed in ${duration}ms`);

      return {
        success: true,
        syncedAt: now,
        duration,
        stats: {
          cities: cities.length,
          zones: totalZones,
          areas: totalAreas,
        },
      };
    } catch (error) {
      console.error("[Pathao Sync] Failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
