import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const promoTables = {
  promos: defineTable({
    code:              v.string(),   // UPPERCASE
    discountType:      v.union(v.literal('percentage'), v.literal('flat')),
    discountValue:     v.number(),
    minimumOrderValue: v.optional(v.number()),
    maximumDiscount:   v.optional(v.number()),
    maxTotalUses:      v.optional(v.number()),
    maxUsesPerUser:    v.optional(v.number()),
    currentUses:       v.number(),
    startsAt:          v.optional(v.number()),  // Unix ms
    expiresAt:         v.optional(v.number()),
    isActive:          v.boolean(),
  })
    .index('by_code',     ['code'])
    .index('by_isActive', ['isActive']),

  promoUsages: defineTable({
    promoId:        v.id('promos'),
    userId:         v.id('users'),
    orderId:        v.id('orders'),
    discountAmount: v.number(),
    usedAt:         v.number(),   // Unix ms
  })
    .index('by_promo',      ['promoId'])
    .index('by_user',       ['userId'])
    .index('by_order',      ['orderId'])
    .index('by_promo_user', ['promoId', 'userId']),

  promoUsageSummary: defineTable({
    promoId:               v.id('promos'),
    totalUses:             v.number(),
    totalDiscountGiven:    v.number(),
    totalRevenueGenerated: v.number(),
    uniqueUsers:           v.number(),
  })
    .index('by_promo', ['promoId']),
};
