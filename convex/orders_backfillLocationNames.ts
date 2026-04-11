import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

type PathaoZone = {
  zone_id: number;
  zone_name: string;
};

type PathaoArea = {
  area_id: number;
  area_name: string;
};

type BackfillResult = {
  totalProcessed: number;
  updated: number;
  skipped: number;
};

type TokenResponse = {
  access_token?: string;
};

type UpdateItem = {
  orderId: Id<"orders">;
  shippingZoneName?: string;
  shippingAreaName?: string;
};

type OrdersPageResult = {
  page: Array<{
    _id: Id<"orders">;
    shippingCityId?: number;
    shippingZoneId?: number;
    shippingAreaId?: number;
    shippingZoneName?: string;
    shippingAreaName?: string;
  }>;
  isDone: boolean;
  continueCursor: string;
};

const DEFAULT_BATCH_SIZE = 100;

function getEnvValue(key: string): string | undefined {
  const maybeProcess = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
  return maybeProcess?.env?.[key];
}

function getPathaoBaseUrl(): string {
  const configured = getEnvValue("PATHAO_BASE_URL")?.trim();
  if (configured) return configured;
  const env = getEnvValue("PATHAO_ENVIRONMENT")?.toLowerCase();
  return env === "production"
    ? "https://api-hermes.pathao.com"
    : "https://courier-api-sandbox.pathao.com";
}

async function issuePathaoToken(): Promise<string> {
  const clientId = getEnvValue("PATHAO_CLIENT_ID")?.trim();
  const clientSecret = getEnvValue("PATHAO_CLIENT_SECRET")?.trim();
  const username = getEnvValue("PATHAO_USERNAME")?.trim();
  const password = getEnvValue("PATHAO_PASSWORD")?.trim();

  if (!clientId || !clientSecret || !username || !password) {
    throw new Error("Missing PATHAO credentials in environment variables");
  }

  const res = await fetch(`${getPathaoBaseUrl()}/aladdin/api/v1/issue-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
      grant_type: "password",
    }),
  });

  if (!res.ok) {
    throw new Error(`Pathao token request failed with status ${res.status}`);
  }

  const json = (await res.json()) as TokenResponse;
  if (!json.access_token) {
    throw new Error("Pathao token response missing access_token");
  }
  return json.access_token;
}

async function getZones(accessToken: string, cityId: number): Promise<PathaoZone[]> {
  const res = await fetch(`${getPathaoBaseUrl()}/aladdin/api/v1/cities/${cityId}/zone-list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Pathao zones request failed for city ${cityId} with status ${res.status}`);
  }

  const json = (await res.json()) as { data?: { data?: PathaoZone[] } };
  return json.data?.data ?? [];
}

async function getAreas(accessToken: string, zoneId: number): Promise<PathaoArea[]> {
  const res = await fetch(`${getPathaoBaseUrl()}/aladdin/api/v1/zones/${zoneId}/area-list`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Pathao areas request failed for zone ${zoneId} with status ${res.status}`);
  }

  const json = (await res.json()) as { data?: { data?: PathaoArea[] } };
  return json.data?.data ?? [];
}

export const fetchOrdersPage = internalQuery({
  args: {
    cursor: v.union(v.string(), v.null()),
    numItems: v.number(),
  },
  handler: async (ctx, { cursor, numItems }) => {
    return await ctx.db.query("orders").paginate({ cursor, numItems });
  },
});

export const applyLocationBackfillBatch = internalMutation({
  args: {
    updates: v.array(
      v.object({
        orderId: v.id("orders"),
        shippingZoneName: v.optional(v.string()),
        shippingAreaName: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { updates }) => {
    let updated = 0;
    let skipped = 0;

    for (const item of updates) {
      try {
        const order = await ctx.db.get(item.orderId);
        if (!order) {
          skipped += 1;
          continue;
        }

        const patch: { shippingZoneName?: string; shippingAreaName?: string } = {};
        if (!order.shippingZoneName && item.shippingZoneName) {
          patch.shippingZoneName = item.shippingZoneName;
        }
        if (!order.shippingAreaName && item.shippingAreaName) {
          patch.shippingAreaName = item.shippingAreaName;
        }

        if (Object.keys(patch).length === 0) {
          skipped += 1;
          continue;
        }

        await ctx.db.patch(order._id, patch);
        updated += 1;
      } catch (error) {
        console.error("[Backfill] Failed patching order:", item.orderId, error);
        skipped += 1;
      }
    }

    return { updated, skipped };
  },
});

export const backfillLocationNames = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { batchSize }): Promise<BackfillResult> => {
    const effectiveBatchSize = Math.max(50, Math.min(100, batchSize ?? DEFAULT_BATCH_SIZE));

    const candidates: Array<{
      _id: Id<"orders">;
      shippingCityId?: number;
      shippingZoneId?: number;
      shippingAreaId?: number;
      shippingZoneName?: string;
      shippingAreaName?: string;
    }> = [];

    let cursor: string | null = null;
    while (true) {
      const fetchOrdersPageRef = internal.orders_backfillLocationNames
        .fetchOrdersPage as typeof internal.orders_backfillLocationNames.fetchOrdersPage;
      const page: OrdersPageResult = await ctx.runQuery(fetchOrdersPageRef, {
        cursor,
        numItems: effectiveBatchSize,
      });

      for (const order of page.page) {
        if (!order.shippingZoneName || !order.shippingAreaName) {
          candidates.push({
            _id: order._id,
            shippingCityId: order.shippingCityId,
            shippingZoneId: order.shippingZoneId,
            shippingAreaId: order.shippingAreaId,
            shippingZoneName: order.shippingZoneName,
            shippingAreaName: order.shippingAreaName,
          });
        }
      }

      if (page.isDone) break;
      cursor = page.continueCursor;
    }

    const cityIds = new Set<number>();
    const zoneKeys = new Set<string>();
    for (const order of candidates) {
      if (!order.shippingCityId || !order.shippingZoneId) continue;
      cityIds.add(order.shippingCityId);
      zoneKeys.add(`${order.shippingCityId}_${order.shippingZoneId}`);
    }

    const zoneMap = new Map<string, string>();
    const areaMap = new Map<string, string>();

    let token: string;
    try {
      token = await issuePathaoToken();
    } catch (error) {
      console.error("[Backfill] Failed to issue Pathao token:", error);
      return { totalProcessed: candidates.length, updated: 0, skipped: candidates.length };
    }

    for (const cityId of cityIds) {
      try {
        const zones = await getZones(token, cityId);
        for (const zone of zones) {
          zoneMap.set(`${cityId}_${zone.zone_id}`, zone.zone_name);
        }
      } catch (error) {
        console.error(`[Backfill] Failed fetching zones for city ${cityId}:`, error);
      }
    }

    for (const zoneKey of zoneKeys) {
      const [cityIdRaw, zoneIdRaw] = zoneKey.split("_");
      const cityId = Number(cityIdRaw);
      const zoneId = Number(zoneIdRaw);
      if (!Number.isFinite(cityId) || !Number.isFinite(zoneId)) continue;

      try {
        const areas = await getAreas(token, zoneId);
        for (const area of areas) {
          areaMap.set(`${cityId}*${zoneId}*${area.area_id}`, area.area_name);
        }
      } catch (error) {
        console.error(`[Backfill] Failed fetching areas for zone ${zoneId}:`, error);
      }
    }

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < candidates.length; i += effectiveBatchSize) {
      const chunk = candidates.slice(i, i + effectiveBatchSize);
      const updates: UpdateItem[] = [];

      for (const order of chunk) {
        if (!order.shippingCityId || !order.shippingZoneId) {
          skipped += 1;
          continue;
        }

        const zoneName = !order.shippingZoneName
          ? zoneMap.get(`${order.shippingCityId}_${order.shippingZoneId}`)
          : undefined;

        const areaName =
          !order.shippingAreaName && order.shippingAreaId
            ? areaMap.get(
                `${order.shippingCityId}*${order.shippingZoneId}*${order.shippingAreaId}`,
              )
            : undefined;

        if (!zoneName && !areaName) {
          skipped += 1;
          continue;
        }

        updates.push({
          orderId: order._id,
          shippingZoneName: zoneName,
          shippingAreaName: areaName,
        });
      }

      if (updates.length === 0) continue;

      try {
        const result = await ctx.runMutation(
          internal.orders_backfillLocationNames.applyLocationBackfillBatch,
          { updates },
        );
        updated += result.updated;
        skipped += result.skipped;
      } catch (error) {
        console.error("[Backfill] Failed applying update batch:", error);
        skipped += updates.length;
      }
    }

    return {
      totalProcessed: candidates.length,
      updated,
      skipped,
    };
  },
});
