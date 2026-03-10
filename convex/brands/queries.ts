/**
 * Brands — public read queries
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── List brands ──────────────────────────────────────────────────────────────

export const listBrands = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { page = 1, pageSize = 50, activeOnly = true }) => {
    let brands = await ctx.db
      .query("brands")
      .filter((q) =>
        activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
      )
      .collect();

    // Sort by displayOrder then name
    brands.sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
    );

    const total = brands.length;
    const offset = (page - 1) * pageSize;
    const paged = brands.slice(offset, offset + pageSize);

    return {
      items: paged.map((b) => ({ ...b, id: b._id })),
      total,
      page,
      pageSize,
    };
  },
});

// ─── Get single brand ─────────────────────────────────────────────────────────

export const getBrandById = query({
  args: { id: v.id("brands") },
  handler: async (ctx, { id }) => {
    const brand = await ctx.db.get(id);
    if (!brand) return null;
    return { ...brand, id: brand._id };
  },
});

export const getBrandBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const brand = await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!brand) return null;
    return { ...brand, id: brand._id };
  },
});
