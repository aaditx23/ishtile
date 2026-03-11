/**
 * Promo engine helpers — called inline from mutations to share transaction.
 */
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";

type MutationCtx = GenericMutationCtx<DataModel>;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PromoValidationResult {
  isValid: boolean;
  discount: number;
  message: string;
  promoId?: Id<"promos">;
}

// ─── Helper: validate promo and calculate discount ──────────────────────────

export async function validateAndCalculateHelper(
  ctx: MutationCtx,
  promoCode: string,
  userId: Id<"users">,
  orderValue: number,
): Promise<PromoValidationResult> {
  const code = promoCode.trim().toUpperCase();
  const now = Date.now();

  const promo = await ctx.db
    .query("promos")
    .withIndex("by_code", (q) => q.eq("code", code))
    .first();

  if (!promo) {
    return { isValid: false, discount: 0, message: "Invalid promo code" };
  }

  if (!promo.isActive) {
    return { isValid: false, discount: 0, message: "This promo code is no longer active" };
  }

  if (promo.startsAt !== undefined && promo.startsAt > now) {
    return { isValid: false, discount: 0, message: "This promo code is not yet active" };
  }

  if (promo.expiresAt !== undefined && promo.expiresAt < now) {
    return { isValid: false, discount: 0, message: "This promo code has expired" };
  }

  if (promo.minimumOrderValue !== undefined && orderValue < promo.minimumOrderValue) {
    return {
      isValid: false,
      discount: 0,
      message: `Minimum order value of ${promo.minimumOrderValue} required`,
    };
  }

  if (promo.maxTotalUses !== undefined && promo.currentUses >= promo.maxTotalUses) {
    return { isValid: false, discount: 0, message: "This promo code has reached its usage limit" };
  }

  if (promo.maxUsesPerUser !== undefined) {
    const usages = await ctx.db
      .query("promoUsages")
      .withIndex("by_promo_user", (q) =>
        q.eq("promoId", promo._id).eq("userId", userId),
      )
      .collect();

    if (usages.length >= promo.maxUsesPerUser) {
      return {
        isValid: false,
        discount: 0,
        message: "You have already used this promo code the maximum number of times",
      };
    }
  }

  // Calculate discount
  let discount: number;
  if (promo.discountType === "flat") {
    discount = Math.min(promo.discountValue, orderValue);
  } else {
    // percentage
    discount = (orderValue * promo.discountValue) / 100;
    if (promo.maximumDiscount !== undefined) {
      discount = Math.min(discount, promo.maximumDiscount);
    }
    discount = Math.min(discount, orderValue);
  }

  // Round to 2 decimal places
  discount = Math.round(discount * 100) / 100;

  return {
    isValid: true,
    discount,
    message: `Promo applied! You saved ${discount}`,
    promoId: promo._id,
  };
}

// ─── Helper: record promo usage + increment currentUses ─────────────────────

export async function applyPromoHelper(
  ctx: MutationCtx,
  promoCode: string,
  userId: Id<"users">,
  orderId: Id<"orders">,
  discountAmount: number,
): Promise<void> {
  const code = promoCode.trim().toUpperCase();

  const promo = await ctx.db
    .query("promos")
    .withIndex("by_code", (q) => q.eq("code", code))
    .first();

  if (!promo) throw new Error("Invalid promo code");

  // Re-check limits under the same transaction (Convex serializes this)
  if (promo.maxTotalUses !== undefined && promo.currentUses >= promo.maxTotalUses) {
    throw new Error("Promo usage limit reached");
  }

  await ctx.db.insert("promoUsages", {
    promoId: promo._id,
    userId,
    orderId,
    discountAmount,
    usedAt: Date.now(),
  });

  await ctx.db.patch(promo._id, {
    currentUses: promo.currentUses + 1,
  });
}

// ─── Helper: revert promo on cancellation ───────────────────────────────────

export async function revertPromoHelper(
  ctx: MutationCtx,
  orderId: Id<"orders">,
): Promise<void> {
  const usage = await ctx.db
    .query("promoUsages")
    .withIndex("by_order", (q) => q.eq("orderId", orderId))
    .first();

  if (!usage) return; // idempotent — nothing to revert

  const promo = await ctx.db.get(usage.promoId);
  if (promo) {
    await ctx.db.patch(promo._id, {
      currentUses: Math.max(0, promo.currentUses - 1),
    });
  }

  await ctx.db.delete(usage._id);
}
