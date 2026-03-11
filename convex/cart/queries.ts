/**
 * Cart — queries
 * Mirrors: GET /api/v1/cart
 * Returns cart with enriched items (variant + product + inventory data).
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getCart = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    let cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!cart) {
      // Return an empty cart shape without inserting (queries are read-only)
      return {
        id: null as unknown as string,
        userId,
        items: [],
        subtotal: 0,
        totalItems: 0,
      };
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart!._id))
      .collect();

    const items = await Promise.all(
      cartItems.map(async (item) => {
        const variant = await ctx.db.get(item.variantId);
        const product = variant ? await ctx.db.get(variant.productId) : null;
        const inv = variant
          ? await ctx.db
              .query("inventory")
              .withIndex("by_variant", (q) => q.eq("variantId", variant._id))
              .first()
          : null;

        const unitPrice = variant?.price ?? 0;
        const lineTotal = unitPrice * item.quantity;

        return {
          id: item._id,
          cartId: item.cartId,
          variantId: item.variantId,
          quantity: item.quantity,
          productName: product?.name ?? "",
          variantSize: variant?.size ?? "",
          variantColor: variant?.color ?? null,
          variantSku: variant?.sku ?? "",
          unitPrice,
          lineTotal,
          imageUrl: product?.imageUrls?.[0] ?? null,
          availableStock: inv?.quantity ?? 0,
          createdAt: item._creationTime,
        };
      }),
    );

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return {
      id: cart._id,
      userId: cart.userId,
      items,
      subtotal,
      totalItems: items.length,
    };
  },
});
