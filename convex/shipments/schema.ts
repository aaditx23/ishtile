import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const shipmentTables = {
  shipments: defineTable({
    orderId:          v.id('orders'),
    consignmentId:    v.optional(v.string()),
    invoiceNumber:    v.optional(v.string()),
    status:           v.union(
                        v.literal('pending'),
                        v.literal('created'),
                        v.literal('picked_up'),
                        v.literal('in_transit'),
                        v.literal('delivered'),
                        v.literal('returned'),
                        v.literal('cancelled'),
                      ),
    trackingCode:     v.optional(v.string()),
    merchantOrderId:  v.optional(v.string()),
    recipientName:    v.string(),
    recipientPhone:   v.string(),
    recipientAddress: v.string(),
    recipientCity:    v.string(),
    recipientZone:    v.optional(v.string()),
    itemValue:        v.number(),
    deliveryCharge:   v.optional(v.number()),
    itemWeight:       v.optional(v.number()),
    createdInPathao:  v.boolean(),
    errorMessage:     v.optional(v.string()),
    pickedUpAt:       v.optional(v.number()),
    deliveredAt:      v.optional(v.number()),
    // Extended Pathao fields
    itemQuantity:         v.optional(v.number()),
    deliveryType:         v.optional(v.number()),
    specialInstructions:  v.optional(v.string()),
    pathaoStatus:         v.optional(v.string()),
    statusUpdateTime:     v.optional(v.number()),
    deliveryProvider:     v.optional(v.string()),
    trackingData:         v.optional(v.string()),
  })
    .index('by_order',       ['orderId'])
    .index('by_consignment', ['consignmentId']),

  pathaoTokens: defineTable({
    accessToken:  v.string(),
    tokenType:    v.string(),
    expiresIn:    v.number(),
    refreshToken: v.optional(v.string()),
    expiresAt:    v.number(),   // Unix ms
  }),

  pathaoStores: defineTable({
    storeId:       v.number(),   // from Pathao API
    storeName:     v.string(),
    contactNumber: v.string(),
    address:       v.string(),
    cityId:        v.number(),
    zoneId:        v.number(),
    areaId:        v.number(),
    isActive:      v.boolean(),
  })
    .index('by_storeId',  ['storeId'])
    .index('by_isActive', ['isActive']),

  payments: defineTable({
    orderId:            v.id('orders'),
    method:             v.union(v.literal('cod'), v.literal('online')),
    status:             v.union(
                          v.literal('pending'),
                          v.literal('completed'),
                          v.literal('failed'),
                          v.literal('refunded'),
                        ),
    amount:             v.number(),
    transactionId:      v.optional(v.string()),
    isWebhookProcessed: v.boolean(),
    paymentDetails:     v.optional(v.string()),  // JSON string
    failureReason:      v.optional(v.string()),
    paidAt:             v.optional(v.number()),
  })
    .index('by_order', ['orderId']),
};
