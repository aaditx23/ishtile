/**
 * Pathao Store Management — Server-side only.
 * Gets or creates the merchant Pathao store.
 * Persists store_id to Convex for resilience across restarts.
 */
import { ConvexHttpClient } from 'convex/browser';
import { getAccessToken, forceNewToken, authHeaders } from './auth';
import type { PathaoStoreData } from './types';
import { getStoreLocation } from './storeLocation';

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL!;

// Module-level cache for the active store_id
let cachedStoreId: number | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the Pathao store_id.
 * Resolution order:
 *   1. PATHAO_STORE_ID env var (fastest, set manually in env)
 *   2. Module-level memory cache
 *   3. Convex pathaoStores table
 *   4. Create new store via Pathao API
 */
export async function getOrCreateStore(): Promise<number> {
  // Tier 1: env var
  const envStoreId = Number(process.env.PATHAO_STORE_ID);
  if (!isNaN(envStoreId) && envStoreId > 0) return envStoreId;

  // Tier 2: memory cache
  if (cachedStoreId) return cachedStoreId;

  // Tier 3: Convex DB
  const dbStoreId = await getStoreFromDb();
  if (dbStoreId) {
    cachedStoreId = dbStoreId;
    return dbStoreId;
  }

  // Tier 4: Create via Pathao API
  const storeId = await createStore();
  cachedStoreId = storeId;
  return storeId;
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function getStoreFromDb(): Promise<number | null> {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const store = await convex.query({ name: 'shipments:getActivePathaoStore' } as any, {});
    return (store as { storeId?: number } | null)?.storeId ?? null;
  } catch {
    return null;
  }
}

async function createStore(): Promise<number> {
  const token = await getAccessToken();
  const { cityId, zoneId, areaId } = await getStoreLocation();

  const payload = {
    name:           process.env.PATHAO_STORE_NAME!,
    contact_name:   process.env.PATHAO_STORE_NAME!,
    contact_number: process.env.PATHAO_STORE_CONTACT!,
    address:        process.env.PATHAO_STORE_ADDRESS!,
    city_id:        cityId,
    zone_id:        zoneId,
    area_id:        areaId,
  };

  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/stores`, {
    method:  'POST',
    headers: authHeaders(token),
    body:    JSON.stringify(payload),
  });

  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/stores`, {
      method:  'POST',
      headers: authHeaders(freshToken),
      body:    JSON.stringify(payload),
    });
    if (!retry.ok) throw new Error(`Pathao store creation failed: HTTP ${retry.status}`);
    return extractStoreId(await retry.json());
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao store creation failed: HTTP ${res.status} — ${text}`);
  }

  const storeId = extractStoreId(await res.json());

  // Persist to Convex (best-effort)
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'shipments:savePathaoStore' } as any,
      {
        storeId:       storeId,
        storeName:     payload.name,
        contactNumber: payload.contact_number,
        address:       payload.address,
        cityId:        payload.city_id,
        zoneId:        payload.zone_id,
        areaId:        payload.area_id,
      },
    );
  } catch {
    // Non-fatal — store still works
  }

  return storeId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractStoreId(json: any): number {
  const store: PathaoStoreData | undefined = json?.data?.store;
  if (!store?.store_id) throw new Error('Invalid store creation response from Pathao');
  return store.store_id;
}
