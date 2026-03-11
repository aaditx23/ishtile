/**
 * Inventory helpers — called inline from mutations to share the same transaction.
 * Also exposes internalMutation wrappers for external callers.
 */
import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel } from "../_generated/dataModel";
import type { Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

// ─── Helper: deduct stock on order placement ────────────────────────────────
// Runs in the CALLER'S transaction (import and call directly).

export async function deductStockHelper(
  ctx: MutationCtx,
  variantId: Id<"productVariants">,
  quantity: number,
  orderId: Id<"orders">,
  userId: Id<"users"> | undefined,
): Promise<void> {
  const inv = await ctx.db
    .query("inventory")
    .withIndex("by_variant", (q) => q.eq("variantId", variantId))
    .first();

  if (!inv) throw new Error("Inventory record not found for variant");

  if (inv.quantity < quantity) {
    throw new Error(`Insufficient stock. Available: ${inv.quantity}`);
  }

  await ctx.db.patch(inv._id, {
    quantity: inv.quantity - quantity,
    reservedQuantity: Math.max(0, inv.reservedQuantity - quantity),
  });

  // Stock history record
  await ctx.db.insert("stockHistory", {
    variantId,
    changeType: "sale",
    quantityChange: -quantity,
    quantityAfter: inv.quantity - quantity,
    referenceType: "order",
    referenceId: orderId,
    notes: `Stock deducted for order ${orderId}`,
    performedBy: userId,
  });
}

// ─── Helper: restore stock on cancellation ──────────────────────────────────

export async function restoreStockHelper(
  ctx: MutationCtx,
  variantId: Id<"productVariants">,
  quantity: number,
  orderId: Id<"orders">,
  userId: Id<"users"> | undefined,
): Promise<void> {
  const inv = await ctx.db
    .query("inventory")
    .withIndex("by_variant", (q) => q.eq("variantId", variantId))
    .first();

  if (!inv) {
    // Create inventory row if somehow missing
    await ctx.db.insert("inventory", {
      variantId,
      quantity,
      reservedQuantity: 0,
    });
    return;
  }

  await ctx.db.patch(inv._id, {
    quantity: inv.quantity + quantity,
  });

  await ctx.db.insert("stockHistory", {
    variantId,
    changeType: "return",
    quantityChange: quantity,
    quantityAfter: inv.quantity + quantity,
    referenceType: "order",
    referenceId: orderId,
    notes: `Stock restored on cancellation of order ${orderId}`,
    performedBy: userId,
  });
}

// ─── internalMutation wrappers (for callers that need separate transactions) ─

export const deductStock = internalMutation({
  args: {
    variantId: v.id("productVariants"),
    quantity: v.number(),
    orderId: v.id("orders"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { variantId, quantity, orderId, userId }) => {
    await deductStockHelper(ctx, variantId, quantity, orderId, userId);
  },
});

export const restoreStock = internalMutation({
  args: {
    variantId: v.id("productVariants"),
    quantity: v.number(),
    orderId: v.id("orders"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { variantId, quantity, orderId, userId }) => {
    await restoreStockHelper(ctx, variantId, quantity, orderId, userId);
  },
});

// ─── Helper: adjust inventory (admin manual adjustment) ─────────────────────

export async function adjustStockHelper(
  ctx: MutationCtx,
  variantId: Id<"productVariants">,
  newQuantity: number,
  note: string,
  performedBy: Id<"users"> | undefined,
): Promise<void> {
  const inv = await ctx.db
    .query("inventory")
    .withIndex("by_variant", (q) => q.eq("variantId", variantId))
    .first();

  if (!inv) {
    await ctx.db.insert("inventory", {
      variantId,
      quantity: newQuantity,
      reservedQuantity: 0,
    });
    return;
  }

  const change = newQuantity - inv.quantity;
  await ctx.db.patch(inv._id, { quantity: newQuantity });

  await ctx.db.insert("stockHistory", {
    variantId,
    changeType: "adjustment",
    quantityChange: change,
    quantityAfter: newQuantity,
    referenceType: "manual",
    notes: note,
    performedBy,
  });
}
