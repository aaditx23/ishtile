import { query } from '../_generated/server';
import { v } from 'convex/values';

export const listLookbooks = query({
  args: {
    activeOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { activeOnly = true, limit = 3 }) => {
    let rows = await ctx.db
      .query('lookbooks')
      .filter((q) => (activeOnly ? q.eq(q.field('isActive'), true) : q.neq(q.field('isActive'), null)))
      .collect();

    rows = rows.sort((a, b) => {
      const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return b._creationTime - a._creationTime;
    });

    return rows.slice(0, limit).map((row) => ({ ...row, id: row._id }));
  },
});

export const getLookbookBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const row = await ctx.db
      .query('lookbooks')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();

    if (!row || !row.isActive) return null;
    return { ...row, id: row._id };
  },
});
