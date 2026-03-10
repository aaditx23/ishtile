/**
 * Categories — public read queries
 * Mirrors: GET /api/v1/categories endpoints (public)
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── List categories ──────────────────────────────────────────────────────────

export const listCategories = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    activeOnly: v.optional(v.boolean()),
    includeSubcategories: v.optional(v.boolean()),
  },
  handler: async (ctx, { page = 1, pageSize = 20, activeOnly = true, includeSubcategories = false }) => {
    let categories = await ctx.db
      .query("categories")
      .filter((q) =>
        activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
      )
      .collect();

    // Sort by displayOrder then name
    categories.sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
    );

    const total = categories.length;
    const offset = (page - 1) * pageSize;
    const paged = categories.slice(offset, offset + pageSize);

    if (!includeSubcategories) {
      return {
        items: paged.map((c) => ({ ...c, id: c._id })),
        total,
        page,
        pageSize,
      };
    }

    // Enrich with subcategories
    const enriched = await Promise.all(
      paged.map(async (cat) => {
        const subcategories = await ctx.db
          .query("subcategories")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .filter((q) =>
            activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
          )
          .collect();

        subcategories.sort(
          (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
        );

        return {
          ...cat,
          id: cat._id,
          subcategories: subcategories.map((s) => ({ ...s, id: s._id })),
        };
      }),
    );

    return { items: enriched, total, page, pageSize };
  },
});

// ─── Get category by ID ───────────────────────────────────────────────────────

export const getCategoryById = query({
  args: {
    id: v.id("categories"),
    includeSubcategories: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, includeSubcategories = true }) => {
    const category = await ctx.db.get(id);
    if (!category) return null;

    if (!includeSubcategories) {
      return { ...category, id: category._id };
    }

    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();


    subcategories.sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
    );

    return {
      ...category,
      id: category._id,
      subcategories: subcategories.map((s) => ({ ...s, id: s._id })),
    };
  },
});

// ─── Get category by slug ─────────────────────────────────────────────────────

export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
    includeSubcategories: v.optional(v.boolean()),
  },
  handler: async (ctx, { slug, includeSubcategories = true }) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!category) return null;

    if (!includeSubcategories) {
      return { ...category, id: category._id };
    }

    const subcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();

    subcategories.sort(
      (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
    );

    return {
      ...category,
      id: category._id,
      subcategories: subcategories.map((s) => ({ ...s, id: s._id })),
    };
  },
});
