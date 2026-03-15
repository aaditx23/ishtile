/**
 * Products — public read queries
 * Mirrors: GET /api/v1/products (list, get by ID, get by slug)
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── List products ────────────────────────────────────────────────────────────

export const listProducts = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
    brandId: v.optional(v.id("brands")),
    search: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    activeOnly: v.optional(v.boolean()),
    includeVariants: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    {
      page = 1,
      pageSize = 20,
      categoryId,
      subcategoryId,
      brandId,
      search,
      isFeatured,
      isTrending,
      activeOnly = true,
      includeVariants = false,
    },
  ) => {
    let products;

    // Use search when provided - search name and SKU with case-insensitive substring matching
    if (search) {
      const searchLower = search.toLowerCase();
      
      // Fetch all products and filter in-memory for substring match
      const allProducts = await ctx.db
        .query("products")
        .filter((q) =>
          activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
        )
        .collect();
      
      products = allProducts.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(searchLower);
        const skuMatch = p.sku.toLowerCase().includes(searchLower);
        const categoryMatch = categoryId ? p.categoryId === categoryId : true;
        return (nameMatch || skuMatch) && categoryMatch;
      });
    } else {
      // Index-based filter: prefer the most selective index
      if (categoryId) {
        products = await ctx.db
          .query("products")
          .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
          .filter((q) =>
            activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
          )
          .collect();
      } else if (brandId) {
        products = await ctx.db
          .query("products")
          .withIndex("by_brand", (q) => q.eq("brandId", brandId))
          .filter((q) =>
            activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
          )
          .collect();
      } else if (isFeatured !== undefined) {
        products = await ctx.db
          .query("products")
          .withIndex("by_isFeatured", (q) => q.eq("isFeatured", isFeatured))
          .filter((q) =>
            activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
          )
          .collect();
      } else {
        products = await ctx.db
          .query("products")
          .filter((q) =>
            activeOnly ? q.eq(q.field("isActive"), true) : q.neq(q.field("isActive"), null),
          )
          .collect();
      }
    }

    // Post-filter
    if (subcategoryId) {
      products = products.filter((p) => p.subcategoryId === subcategoryId);
    }
    if (brandId && !search) {
      products = products.filter((p) => p.brandId === brandId);
    }
    if (isFeatured !== undefined && !brandId && !categoryId) {
      products = products.filter((p) => p.isFeatured === isFeatured);
    }
    if (isTrending !== undefined) {
      products = products.filter((p) => (p.trending ?? false) === isTrending);
    }

    // Sort by creation time desc
    products.sort((a, b) => b._creationTime - a._creationTime);

    const total = products.length;
    const offset = (page - 1) * pageSize;
    const paged = products.slice(offset, offset + pageSize);

    if (!includeVariants) {
      return {
        items: paged.map((p) => ({ ...p, id: p._id })),
        total,
        page,
        pageSize,
      };
    }

    // Enrich with variants + inventory
    const enriched = await Promise.all(
      paged.map(async (product) => {
        const variants = await ctx.db
          .query("productVariants")
          .withIndex("by_product", (q) => q.eq("productId", product._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        const variantsWithStock = await Promise.all(
          variants.map(async (variant) => {
            const inv = await ctx.db
              .query("inventory")
              .withIndex("by_variant", (q) => q.eq("variantId", variant._id))
              .first();
            return {
              ...variant,
              id: variant._id,
              stock: inv?.quantity ?? 0,
            };
          }),
        );

        return { ...product, id: product._id, variants: variantsWithStock };
      }),
    );

    return { items: enriched, total, page, pageSize };
  },
});

// ─── Get product by ID ────────────────────────────────────────────────────────

export const getProductById = query({
  args: {
    id: v.id("products"),
    includeVariants: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, includeVariants = true }) => {
    const product = await ctx.db.get(id);
    if (!product) return null;

    if (!includeVariants) {
      return { ...product, id: product._id };
    }

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", id))
      .collect();

    const variantsWithStock = await Promise.all(
      variants.map(async (variant) => {
        const inv = await ctx.db
          .query("inventory")
          .withIndex("by_variant", (q) => q.eq("variantId", variant._id))
          .first();
        return { ...variant, id: variant._id, stock: inv?.quantity ?? 0 };
      }),
    );

    return { ...product, id: product._id, variants: variantsWithStock };
  },
});

// ─── Get product by slug ──────────────────────────────────────────────────────

export const getProductBySlug = query({
  args: {
    slug: v.string(),
    includeVariants: v.optional(v.boolean()),
  },
  handler: async (ctx, { slug, includeVariants = true }) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!product) return null;

    if (!includeVariants) {
      return { ...product, id: product._id };
    }

    const variants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", product._id))
      .collect();

    const variantsWithStock = await Promise.all(
      variants.map(async (variant) => {
        const inv = await ctx.db
          .query("inventory")
          .withIndex("by_variant", (q) => q.eq("variantId", variant._id))
          .first();
        return { ...variant, id: variant._id, stock: inv?.quantity ?? 0 };
      }),
    );

    return { ...product, id: product._id, variants: variantsWithStock };
  },
});
