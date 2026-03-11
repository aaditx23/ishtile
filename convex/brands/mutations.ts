/**
 * Brands — admin mutations
 * All require role === 'admin' (enforced by caller passing & checking role).
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Brand CRUD ───────────────────────────────────────────────────────────────

export const createBrand = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, slug, imageUrl, description, displayOrder, isActive }) => {
    // Slug uniqueness
    const existing = await ctx.db
      .query("brands")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("A brand with this slug already exists");

    const id = await ctx.db.insert("brands", {
      name,
      slug,
      imageUrl,
      description,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
    });

    return { id };
  },
});

export const updateBrand = mutation({
  args: {
    id: v.id("brands"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, slug, ...rest }) => {
    const brand = await ctx.db.get(id);
    if (!brand) throw new Error("Brand not found");

    // Slug uniqueness if changing
    if (slug && slug !== brand.slug) {
      const dup = await ctx.db
        .query("brands")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (dup) throw new Error("A brand with this slug already exists");
    }

    await ctx.db.patch(id, { ...(slug ? { slug } : {}), ...rest });
    return { id };
  },
});

export const deleteBrand = mutation({
  args: { id: v.id("brands") },
  handler: async (ctx, { id }) => {
    const brand = await ctx.db.get(id);
    if (!brand) throw new Error("Brand not found");

    // Check if any products use this brand
    const productsWithBrand = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("brandId"), id))
      .first();

    if (productsWithBrand) {
      throw new Error("Cannot delete brand: it is used by existing products");
    }

    await ctx.db.delete(id);
    return { success: true };
  },
});
