import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const lookbookTables = {
  lookbooks: defineTable({
    title: v.string(),
    slug: v.string(),
    body: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    coverImageUrl: v.string(),
    imageUrls: v.array(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index('by_slug', ['slug'])
    .index('by_isActive', ['isActive']),
};
