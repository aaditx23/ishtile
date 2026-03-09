/**
 * Favourites — queries
 * Mirrors: GET /api/v1/favourites
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

export const listFavourites = query({
  args: {
    userId: v.id("users"),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { userId, page = 1, pageSize = 20 }) => {
    const favs = await ctx.db
      .query("favourites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const total = favs.length;
    const offset = (page - 1) * pageSize;
    const paged = favs.slice(offset, offset + pageSize);

    const items = await Promise.all(
      paged.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        return {
          id: fav._id,
          userId: fav.userId,
          productId: fav.productId,
          productName: product?.name ?? "",
          productSlug: product?.slug ?? "",
          basePrice: product?.basePrice ?? 0,
          imageUrl: product?.imageUrls?.[0] ?? null,
          isActive: product?.isActive ?? false,
          createdAt: fav._creationTime,
        };
      }),
    );

    return { items, total, page, pageSize };
  },
});

// ─── Check if product is favourited ──────────────────────────────────────────

export const getFavouriteByProduct = query({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, { userId, productId }) => {
    const fav = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", productId),
      )
      .first();

    if (!fav) return null;
    return { id: fav._id };
  },
});
