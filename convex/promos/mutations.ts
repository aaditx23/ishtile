/**
 * Promos — mutations
 * Mirrors: POST/PATCH/DELETE /api/v1/promos (admin only)
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Create promo ─────────────────────────────────────────────────────────────

export const createPromo = mutation({
  args: {
    code: v.string(),
    description: v.optional(v.string()),
    discountType: v.union(v.literal("flat"), v.literal("percentage")),
    discountValue: v.number(),
    minimumOrderValue: v.optional(v.number()),
    maximumDiscount: v.optional(v.number()),
    maxTotalUses: v.optional(v.number()),
    maxUsesPerUser: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { adminUserId, ...rest } = args;

    const code = rest.code.trim().toUpperCase();

    const existing = await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (existing) throw new Error(`Promo code "${code}" already exists`);

    const promoId = await ctx.db.insert("promos", {
      ...rest,
      code,
      currentUses: 0,
      isActive: rest.isActive ?? true,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "create",
      entityType: "promo",
      entityId: promoId,
      description: `Promo "${code}" created`,
    });

    return promoId;
  },
});

// ─── Update promo ─────────────────────────────────────────────────────────────

export const updatePromo = mutation({
  args: {
    promoId: v.id("promos"),
    code: v.optional(v.string()),
    description: v.optional(v.string()),
    discountType: v.optional(v.union(v.literal("flat"), v.literal("percentage"))),
    discountValue: v.optional(v.number()),
    minimumOrderValue: v.optional(v.number()),
    maximumDiscount: v.optional(v.number()),
    maxTotalUses: v.optional(v.number()),
    maxUsesPerUser: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { promoId, adminUserId, code, ...rest }) => {
    const promo = await ctx.db.get(promoId);
    if (!promo) throw new Error("Promo not found");

    const patch: Record<string, unknown> = { ...rest };

    if (code !== undefined) {
      const normalized = code.trim().toUpperCase();
      if (normalized !== promo.code) {
        const dup = await ctx.db
          .query("promos")
          .withIndex("by_code", (q) => q.eq("code", normalized))
          .first();
        if (dup) throw new Error(`Promo code "${normalized}" already exists`);
      }
      patch.code = normalized;
    }

    await ctx.db.patch(promoId, patch);

    return { success: true };
  },
});

// ─── Delete promo ─────────────────────────────────────────────────────────────

export const deletePromo = mutation({
  args: {
    promoId: v.id("promos"),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { promoId, adminUserId }) => {
    const promo = await ctx.db.get(promoId);
    if (!promo) throw new Error("Promo not found");

    await ctx.db.delete(promoId);

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "delete",
      entityType: "promo",
      entityId: promoId,
      description: `Promo "${promo.code}" deleted`,
    });

    return { success: true };
  },
});
