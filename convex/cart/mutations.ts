/**
 * Cart — mutations
 * Mirrors: POST /items, PUT /items/{id}, DELETE /items/{id}, DELETE /clear
 * Stock validation follows the same rules as the Python backend.
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Ensure user has a cart, return its ID ──────────────────────────────────
async function ensureCart(ctx: any, userId: any) {
  const existing = await ctx.db
    .query("carts")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (existing) return existing._id;

  return await ctx.db.insert("carts", { userId });
}

// ─── Add item to cart ─────────────────────────────────────────────────────────

export const addItem = mutation({
  args: {
    userId: v.id("users"),
    variantId: v.id("productVariants"),
    quantity: v.number(),
  },
  handler: async (ctx, { userId, variantId, quantity }) => {
    if (quantity <= 0) throw new Error("Quantity must be greater than 0");

    // Validate variant is active
    const variant = await ctx.db.get(variantId);
    if (!variant || !variant.isActive) throw new Error("Variant not found or unavailable");

    // Stock check
    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", variantId))
      .first();

    const availableStock = inv?.quantity ?? 0;
    if (availableStock <= 0) throw new Error("Product out of stock");

    const cartId = await ensureCart(ctx, userId);

    // Check existing cart item
    const existing = await ctx.db
      .query("cartItems")
      .withIndex("by_cart_and_variant", (q) =>
        q.eq("cartId", cartId).eq("variantId", variantId),
      )
      .first();

    const currentQty = existing?.quantity ?? 0;
    const totalAfter = currentQty + quantity;

    if (totalAfter > availableStock) {
      throw new Error(
        `Not enough stock. Available: ${availableStock}, already in cart: ${currentQty}`,
      );
    }

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: totalAfter });
    } else {
      await ctx.db.insert("cartItems", { cartId, variantId, quantity: totalAfter });
    }

    return { success: true };
  },
});

// ─── Update cart item quantity ────────────────────────────────────────────────

export const updateItem = mutation({
  args: {
    itemId: v.id("cartItems"),
    userId: v.id("users"),
    quantity: v.number(),
  },
  handler: async (ctx, { itemId, userId, quantity }) => {
    // Verify item belongs to user's cart
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Cart item not found");

    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== userId) throw new Error("Cart item not found");

    if (quantity <= 0) {
      await ctx.db.delete(itemId);
      return { removed: true };
    }

    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", item.variantId))
      .first();

    const availableStock = inv?.quantity ?? 0;

    if (availableStock === 0) {
      await ctx.db.delete(itemId);
      return { removed: true, reason: "out_of_stock" };
    }

    const clamped = Math.min(quantity, availableStock);
    await ctx.db.patch(itemId, { quantity: clamped });

    return { quantity: clamped };
  },
});

// ─── Remove cart item ─────────────────────────────────────────────────────────

export const removeItem = mutation({
  args: {
    itemId: v.id("cartItems"),
    userId: v.id("users"),
  },
  handler: async (ctx, { itemId, userId }) => {
    const item = await ctx.db.get(itemId);
    if (!item) throw new Error("Cart item not found");

    const cart = await ctx.db.get(item.cartId);
    if (!cart || cart.userId !== userId) throw new Error("Cart item not found");

    await ctx.db.delete(itemId);
    return { success: true };
  },
});

// ─── Clear cart ───────────────────────────────────────────────────────────────

export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!cart) return { success: true };

    const items = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    return { success: true };
  },
});
