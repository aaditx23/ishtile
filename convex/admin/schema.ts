import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const adminTables = {
  adminSettings: defineTable({
    insideDhakaShippingCost:  v.number(),
    outsideDhakaShippingCost: v.number(),
    // Future settings can be added here:
    // taxRate: v.optional(v.number()),
    // minOrderAmount: v.optional(v.number()),
  }),

  memos: defineTable({
    orderId:     v.id('orders'),
    memoNumber:  v.string(),
    pdfUrl:      v.optional(v.string()),  // Cloudinary URL
    memoContent: v.optional(v.string()),  // HTML or JSON
    isEdited:    v.boolean(),
  })
    .index('by_order',      ['orderId'])
    .index('by_memoNumber', ['memoNumber']),

  auditLogs: defineTable({
    userId:      v.optional(v.id('users')),
    actionType:  v.string(),
    entityType:  v.string(),
    entityId:    v.optional(v.string()),  // Convex ID as string
    oldValue:    v.optional(v.string()),  // JSON
    newValue:    v.optional(v.string()),  // JSON
    description: v.optional(v.string()),
    ipAddress:   v.optional(v.string()),
    userAgent:   v.optional(v.string()),
  })
    .index('by_actionType', ['actionType']),

  idempotencyKeys: defineTable({
    key:    v.string(),   // "{consignment_id}:{order_status_slug}"
    source: v.string(),   // 'pathao_webhook'
  })
    .index('by_key', ['key']),
};
