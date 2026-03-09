/**
 * Favourites — mutations
 * Mirrors: POST /api/v1/favourites, DELETE /api/v1/favourites/{id}
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const addFavourite = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, { userId, productId }) => {
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");

    // Idempotent — check if already favourited
    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", userId).eq("productId", productId),
      )
      .first();

    if (existing) throw new Error("Product already in favourites");

    const id = await ctx.db.insert("favourites", { userId, productId });
    return { id };
  },
});

export const removeFavourite = mutation({
  args: {
    favouriteId: v.id("favourites"),
    userId: v.id("users"),
  },
  handler: async (ctx, { favouriteId, userId }) => {
    const fav = await ctx.db.get(favouriteId);
    if (!fav || fav.userId !== userId) throw new Error("Favourite not found");

    await ctx.db.delete(favouriteId);
    return { success: true };
  },
});

// Remove by productId (convenience for toggle behaviour)
export const removeFavouriteByProduct = mutation({
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

    if (!fav) throw new Error("Favourite not found");
    await ctx.db.delete(fav._id);
    return { success: true };
  },
});
