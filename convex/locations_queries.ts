/**
 * Location cache queries
 * Read-only access to cached Pathao location data
 */
import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all locations (cities, zones, areas)
 * Used by CSV resolver to preload all data
 */
export const getAllLocations = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("locations").collect();
  },
});

/**
 * Get sync metadata (last sync timestamp)
 * Internal query - only callable from actions
 */
export const getSyncMeta = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locationSyncMeta")
      .withIndex("by_key", (q) => q.eq("key", "last_sync"))
      .first();
  },
});

/**
 * Get cities only (for debugging/admin)
 */
export const getCities = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_city", (q) => q.eq("type", "city"))
      .collect();
  },
});

/**
 * Get zones for a city (for debugging/admin)
 */
export const getZonesByCityId = query({
  args: { cityId: v.number() },
  handler: async (ctx, { cityId }) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_zone", (q) => q.eq("type", "zone").eq("cityId", cityId))
      .collect();
  },
});

/**
 * Get areas for a zone (for debugging/admin)
 */
export const getAreasByZoneId = query({
  args: { cityId: v.number(), zoneId: v.number() },
  handler: async (ctx, { cityId, zoneId }) => {
    return await ctx.db
      .query("locations")
      .withIndex("by_area", (q) =>
        q.eq("type", "area").eq("cityId", cityId).eq("zoneId", zoneId)
      )
      .collect();
  },
});
