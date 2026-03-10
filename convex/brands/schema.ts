import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const brandTables = {
  brands: defineTable({
    name:         v.string(),
    slug:         v.string(),
    imageUrl:     v.optional(v.string()),
    description:  v.optional(v.string()),
    displayOrder: v.number(),
    isActive:     v.boolean(),
  })
    .index('by_slug',     ['slug'])
    .index('by_isActive', ['isActive']),
};
