import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const orderTables = {
  orders: defineTable({
    orderNumber:         v.string(),   // "ORD-XXXXXXXX"
    userId:              v.id('users'),
    status:              v.union(
                           v.literal('pending'),
                           v.literal('confirmed'),
                           v.literal('assigned'),
                           v.literal('shipped'),
                           v.literal('delivered'),
                           v.literal('cancelled'),
                         ),
    subtotal:            v.number(),
    promoDiscount:       v.number(),
    shippingCost:        v.number(),
    total:               v.number(),
    deliveryMode:        v.union(v.literal('manual'), v.literal('pathao')),
    pathaoParcelCreated: v.optional(v.boolean()),
    pathaoConsignmentId: v.optional(v.string()),
    pathaoStatus:        v.optional(v.string()),
    pathaoPrice:         v.optional(v.number()),
    pathaoRawPayload:    v.optional(v.any()),
    shippingName:        v.string(),
    shippingPhone:       v.string(),
    shippingAddress:     v.string(),
    shippingCity:        v.string(),
    shippingPostalCode:  v.optional(v.string()),
    shippingAddressLine: v.optional(v.string()),
    shippingCityId:      v.optional(v.number()),
    shippingZoneId:      v.optional(v.number()),
    shippingAreaId:      v.optional(v.number()),
    customerNotes:       v.optional(v.string()),
    adminNotes:          v.optional(v.string()),
    isPaid:              v.boolean(),
    confirmedAt:         v.optional(v.number()),
    shippedAt:           v.optional(v.number()),
    deliveredAt:         v.optional(v.number()),
    cancelledAt:         v.optional(v.number()),
  })
    .index('by_user',        ['userId'])
    .index('by_status',      ['status'])
    .index('by_deliveryMode',['deliveryMode'])
    .index('by_consignment', ['pathaoConsignmentId'])
    .index('by_orderNumber', ['orderNumber']),

  orderItems: defineTable({
    orderId:      v.id('orders'),
    variantId:    v.id('productVariants'),
    productName:  v.string(),    // snapshot at purchase time
    variantSize:  v.string(),
    variantColor: v.optional(v.string()),
    variantSku:   v.string(),
    unitPrice:    v.number(),
    quantity:     v.number(),
    lineTotal:    v.number(),
  })
    .index('by_order', ['orderId']),
};
