/**
 * Promos — queries
 * Mirrors: GET /api/v1/promos (admin list) + GET /api/v1/promos/validate (buyer)
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── List promos (admin) ──────────────────────────────────────────────────────

export const listPromos = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    const all = await ctx.db.query("promos").order("desc").collect();

    const filtered = args.activeOnly
      ? all.filter((p) => p.isActive)
      : all;

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const items = filtered.slice(offset, offset + pageSize);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },
});

// ─── Get promo by code ────────────────────────────────────────────────────────

export const getPromoByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", code.trim().toUpperCase()))
      .first();
  },
});

// ─── Validate promo (buyer preview — no side effects) ─────────────────────────

export const validatePromo = query({
  args: {
    promoCode: v.string(),
    userId: v.id("users"),
    orderValue: v.number(),
  },
  handler: async (ctx, { promoCode, userId, orderValue }) => {
    const code = promoCode.trim().toUpperCase();
    const now = Date.now();

    const promo = await ctx.db
      .query("promos")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!promo || !promo.isActive) {
      return { isValid: false, message: "Promo code not found or inactive", discount: 0 };
    }

    if (promo.startsAt && promo.startsAt > now) {
      return { isValid: false, message: "Promo is not yet active", discount: 0 };
    }

    if (promo.expiresAt && promo.expiresAt < now) {
      return { isValid: false, message: "Promo has expired", discount: 0 };
    }

    if (promo.minimumOrderValue && orderValue < promo.minimumOrderValue) {
      return {
        isValid: false,
        message: `Minimum order value for this promo is ${promo.minimumOrderValue}`,
        discount: 0,
      };
    }

    if (promo.maxTotalUses && promo.currentUses >= promo.maxTotalUses) {
      return { isValid: false, message: "Promo has reached its usage limit", discount: 0 };
    }

    if (promo.maxUsesPerUser) {
      const userUsages = await ctx.db
        .query("promoUsages")
        .withIndex("by_promo", (q) => q.eq("promoId", promo._id))
        .filter((q) => q.eq(q.field("userId"), userId))
        .collect();

      if (userUsages.length >= promo.maxUsesPerUser) {
        return {
          isValid: false,
          message: "You have already used this promo the maximum number of times",
          discount: 0,
        };
      }
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === "flat") {
      discount = promo.discountValue;
    } else if (promo.discountType === "percentage") {
      discount = (orderValue * promo.discountValue) / 100;
      if (promo.maximumDiscount) {
        discount = Math.min(discount, promo.maximumDiscount);
      }
    }

    discount = Math.min(discount, orderValue); // never exceed order value

    return {
      isValid: true,
      message: "Promo applied successfully",
      discount,
      promoId: promo._id,
      promoCode: promo.code,
    };
  },
});
