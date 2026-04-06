/**
 * Location cache mutations (internal)
 * UPSERT operations for syncing Pathao data
 */
import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Batch upsert locations (internal)
 * More efficient than individual upserts
 */
export const batchUpsertLocations = internalMutation({
  args: {
    locations: v.array(
      v.object({
        type: v.union(v.literal("city"), v.literal("zone"), v.literal("area")),
        cityId: v.number(),
        zoneId: v.optional(v.number()),
        areaId: v.optional(v.number()),
        name: v.string(),
      })
    ),
  },
  handler: async (ctx, { locations }) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const loc of locations) {
      let existing = null;

      // Find existing based on type
      if (loc.type === "city") {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_city", (q) =>
            q.eq("type", "city").eq("cityId", loc.cityId)
          )
          .first();
      } else if (loc.type === "zone" && loc.zoneId) {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_zone", (q) =>
            q
              .eq("type", "zone")
              .eq("cityId", loc.cityId)
              .eq("zoneId", loc.zoneId)
          )
          .first();
      } else if (loc.type === "area" && loc.zoneId && loc.areaId) {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_area", (q) =>
            q
              .eq("type", "area")
              .eq("cityId", loc.cityId)
              .eq("zoneId", loc.zoneId)
              .eq("areaId", loc.areaId)
          )
          .first();
      }

      if (existing) {
        // Update existing
        await ctx.db.patch(existing._id, {
          name: loc.name,
          lastUpdatedAt: now,
        });
        updated++;
      } else {
        // Insert new
        await ctx.db.insert("locations", {
          type: loc.type,
          cityId: loc.cityId,
          zoneId: loc.zoneId,
          areaId: loc.areaId,
          name: loc.name,
          lastUpdatedAt: now,
        });
        inserted++;
      }
    }

    return { inserted, updated };
  },
});

/**
 * PUBLIC: Batch upsert locations (for external scripts)
 */
export const batchUpsertLocationsPublic = mutation({
  args: {
    locations: v.array(
      v.object({
        type: v.union(v.literal("city"), v.literal("zone"), v.literal("area")),
        cityId: v.number(),
        zoneId: v.optional(v.number()),
        areaId: v.optional(v.number()),
        name: v.string(),
      })
    ),
  },
  handler: async (ctx, { locations }) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const loc of locations) {
      let existing = null;

      if (loc.type === "city") {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_city", (q) =>
            q.eq("type", "city").eq("cityId", loc.cityId)
          )
          .first();
      } else if (loc.type === "zone" && loc.zoneId) {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_zone", (q) =>
            q
              .eq("type", "zone")
              .eq("cityId", loc.cityId)
              .eq("zoneId", loc.zoneId)
          )
          .first();
      } else if (loc.type === "area" && loc.zoneId && loc.areaId) {
        existing = await ctx.db
          .query("locations")
          .withIndex("by_area", (q) =>
            q
              .eq("type", "area")
              .eq("cityId", loc.cityId)
              .eq("zoneId", loc.zoneId)
              .eq("areaId", loc.areaId)
          )
          .first();
      }

      if (existing) {
        await ctx.db.patch(existing._id, {
          name: loc.name,
          lastUpdatedAt: now,
        });
        updated++;
      } else {
        await ctx.db.insert("locations", {
          type: loc.type,
          cityId: loc.cityId,
          zoneId: loc.zoneId,
          areaId: loc.areaId,
          name: loc.name,
          lastUpdatedAt: now,
        });
        inserted++;
      }
    }

    return { inserted, updated };
  },
});

/**
 * Update sync metadata timestamp (internal)
 */
export const updateSyncMeta = internalMutation({
  args: {
    lastSyncedAt: v.number(),
  },
  handler: async (ctx, { lastSyncedAt }) => {
    const existing = await ctx.db
      .query("locationSyncMeta")
      .withIndex("by_key", (q) => q.eq("key", "last_sync"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSyncedAt });
    } else {
      await ctx.db.insert("locationSyncMeta", {
        key: "last_sync",
        lastSyncedAt,
      });
    }
  },
});

/**
 * PUBLIC: Update sync metadata timestamp (for external scripts)
 */
export const updateSyncMetaPublic = mutation({
  args: {
    lastSyncedAt: v.number(),
  },
  handler: async (ctx, { lastSyncedAt }) => {
    const existing = await ctx.db
      .query("locationSyncMeta")
      .withIndex("by_key", (q) => q.eq("key", "last_sync"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSyncedAt });
    } else {
      await ctx.db.insert("locationSyncMeta", {
        key: "last_sync",
        lastSyncedAt,
      });
    }
  },
});
