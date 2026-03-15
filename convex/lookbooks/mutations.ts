import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const createLookbook = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    body: v.optional(v.string()),
    coverImageUrl: v.string(),
    imageUrls: v.array(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('lookbooks')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (existing) throw new Error('Lookbook slug already exists');

    const id = await ctx.db.insert('lookbooks', {
      title: args.title,
      slug: args.slug,
      body: args.body,
      excerpt: args.body,
      coverImageUrl: args.coverImageUrl,
      imageUrls: args.imageUrls,
      displayOrder: args.displayOrder ?? 0,
      isActive: args.isActive,
    });

    return { id };
  },
});

export const updateLookbook = mutation({
  args: {
    lookbookId: v.id('lookbooks'),
    title: v.string(),
    slug: v.string(),
    body: v.optional(v.string()),
    coverImageUrl: v.string(),
    imageUrls: v.array(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.lookbookId);
    if (!existing) throw new Error('Lookbook not found');

    if (args.slug !== existing.slug) {
      const slugDup = await ctx.db
        .query('lookbooks')
        .withIndex('by_slug', (q) => q.eq('slug', args.slug))
        .first();
      if (slugDup) throw new Error('Lookbook slug already exists');
    }

    await ctx.db.patch(args.lookbookId, {
      title: args.title,
      slug: args.slug,
      body: args.body,
      excerpt: args.body,
      coverImageUrl: args.coverImageUrl,
      imageUrls: args.imageUrls,
      displayOrder: args.displayOrder ?? 0,
      isActive: args.isActive,
    });

    return { success: true };
  },
});

export const deleteLookbook = mutation({
  args: { lookbookId: v.id('lookbooks') },
  handler: async (ctx, { lookbookId }) => {
    const existing = await ctx.db.get(lookbookId);
    if (!existing) throw new Error('Lookbook not found');

    await ctx.db.delete(lookbookId);
    return { success: true };
  },
});
