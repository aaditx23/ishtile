import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const analyticsTables = {
  dailySalesSummary: defineTable({
    summaryDate:      v.string(),            // "2026-03-09" ISO date
    totalOrders:      v.number(),
    totalRevenue:     v.number(),
    totalDiscount:    v.number(),
    totalShipping:    v.number(),
    // All status counters are optional for forward/backward compatibility
    newOrders:        v.optional(v.number()),
    pendingOrders:    v.optional(v.number()),
    confirmedOrders:  v.optional(v.number()),
    assignedOrders:   v.optional(v.number()),
    shippedOrders:    v.optional(v.number()),
    deliveredOrders:  v.optional(v.number()),
    cancelledOrders:  v.optional(v.number()),
    uniqueCustomers:  v.number(),
    newCustomers:     v.number(),
  })
    .index('by_date', ['summaryDate']),

  productSalesSummary: defineTable({
    productId:         v.id('products'),
    variantId:         v.optional(v.id('productVariants')),
    totalQuantitySold: v.number(),
    totalRevenue:      v.number(),
    totalOrders:       v.number(),
  })
    .index('by_product', ['productId']),
};
