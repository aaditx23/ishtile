import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Location cache schema
 * Single table stores cities, zones, and areas from Pathao API
 */
export const locationTables = {
  locations: defineTable({
    type: v.union(
      v.literal('city'),
      v.literal('zone'),
      v.literal('area')
    ),
    cityId: v.number(),
    zoneId: v.optional(v.number()),
    areaId: v.optional(v.number()),
    name: v.string(),
    lastUpdatedAt: v.number(),  // Unix timestamp
  })
    .index('by_city', ['type', 'cityId'])
    .index('by_zone', ['type', 'cityId', 'zoneId'])
    .index('by_area', ['type', 'cityId', 'zoneId', 'areaId']),

  locationSyncMeta: defineTable({
    key: v.string(),           // 'last_sync'
    lastSyncedAt: v.number(),  // Unix timestamp
  })
    .index('by_key', ['key']),
};
