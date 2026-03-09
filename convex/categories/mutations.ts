/**
 * Categories — admin mutations
 * Mirrors: POST/PUT/DELETE /api/v1/categories and /api/v1/categories/{id}/subcategories
 * All require role === 'admin' (enforced by caller passing & checking role).
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Category CRUD ────────────────────────────────────────────────────────────

export const createCategory = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { name, slug, description, imageUrl, imageUrls, displayOrder, isActive }) => {
    // Slug uniqueness
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("A category with this slug already exists");

    const id = await ctx.db.insert("categories", {
      name,
      slug,
      description,
      imageUrl,
      imageUrls: imageUrls ?? [],
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
    });

    return { id };
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const category = await ctx.db.get(id);
    if (!category) throw new Error("Category not found");

    if (fields.slug && fields.slug !== category.slug) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", fields.slug!))
        .first();
      if (existing) throw new Error("A category with this slug already exists");
    }

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );

    await ctx.db.patch(id, patch);
    return { id };
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    const category = await ctx.db.get(id);
    if (!category) throw new Error("Category not found");
    await ctx.db.delete(id);
    return { success: true };
  },
});

// ─── Category image ───────────────────────────────────────────────────────────

export const setCategoryImage = mutation({
  args: {
    id: v.id("categories"),
    imageUrl: v.string(),
    // Also append to imageUrls array
    appendToList: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, imageUrl, appendToList = true }) => {
    const category = await ctx.db.get(id);
    if (!category) throw new Error("Category not found");

    const imageUrls = appendToList
      ? [...new Set([...(category.imageUrls ?? []), imageUrl])]
      : [imageUrl];

    await ctx.db.patch(id, { imageUrl, imageUrls });
    return { id };
  },
});

// ─── Subcategory CRUD ─────────────────────────────────────────────────────────

export const createSubcategory = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { categoryId, name, slug, description, imageUrl, displayOrder, isActive }) => {
    const parent = await ctx.db.get(categoryId);
    if (!parent) throw new Error("Category not found");

    const existing = await ctx.db
      .query("subcategories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("A subcategory with this slug already exists");

    const id = await ctx.db.insert("subcategories", {
      categoryId,
      name,
      slug,
      description,
      imageUrl,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
    });

    return { id };
  },
});

export const updateSubcategory = mutation({
  args: {
    id: v.id("subcategories"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const sub = await ctx.db.get(id);
    if (!sub) throw new Error("Subcategory not found");

    if (fields.slug && fields.slug !== sub.slug) {
      const existing = await ctx.db
        .query("subcategories")
        .withIndex("by_slug", (q) => q.eq("slug", fields.slug!))
        .first();
      if (existing) throw new Error("A subcategory with this slug already exists");
    }

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);
    return { id };
  },
});

export const deleteSubcategory = mutation({
  args: { id: v.id("subcategories") },
  handler: async (ctx, { id }) => {
    const sub = await ctx.db.get(id);
    if (!sub) throw new Error("Subcategory not found");
    await ctx.db.delete(id);
    return { success: true };
  },
});
