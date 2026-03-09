import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const categoryTables = {
  categories: defineTable({
    name:         v.string(),
    slug:         v.string(),
    description:  v.optional(v.string()),
    imageUrl:     v.optional(v.string()),     // legacy single image
    imageUrls:    v.array(v.string()),
    displayOrder: v.number(),
    isActive:     v.boolean(),
  })
    .index('by_slug',     ['slug'])
    .index('by_isActive', ['isActive']),

  subcategories: defineTable({
    categoryId:   v.id('categories'),
    name:         v.string(),
    slug:         v.string(),
    description:  v.optional(v.string()),
    imageUrl:     v.optional(v.string()),
    displayOrder: v.number(),
    isActive:     v.boolean(),
  })
    .index('by_category', ['categoryId'])
    .index('by_slug',     ['slug']),
};
