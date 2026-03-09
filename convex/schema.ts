import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({

  // ─── Users ───────────────────────────────────────────────────────────────

  users: defineTable({
    username:     v.optional(v.string()),
    phone:        v.optional(v.string()),
    email:        v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    fullName:     v.optional(v.string()),
    avatarUrl:    v.optional(v.string()),
    role:         v.union(v.literal('buyer'), v.literal('admin')),
    isActive:     v.boolean(),
    isVerified:   v.boolean(),
    googleId:     v.optional(v.string()),
    facebookId:   v.optional(v.string()),
    addressLine:  v.optional(v.string()),
    city:         v.optional(v.string()),
    postalCode:   v.optional(v.string()),
    lastLoginAt:  v.optional(v.number()),   // Unix ms timestamp
  })
    .index('by_phone',    ['phone'])
    .index('by_email',    ['email'])
    .index('by_username', ['username'])
    .index('by_role',     ['role']),

  // ─── User Addresses ───────────────────────────────────────────────────────

  userAddresses: defineTable({
    userId:      v.id('users'),
    name:        v.optional(v.string()),
    phone:       v.optional(v.string()),
    addressLine: v.string(),
    city:        v.string(),
    area:        v.optional(v.string()),
    postalCode:  v.optional(v.string()),
    cityId:      v.optional(v.number()),  // Pathao city ID
    zoneId:      v.optional(v.number()),  // Pathao zone ID
    areaId:      v.optional(v.number()),  // Pathao area ID
    isDefault:   v.boolean(),
  })
    .index('by_user', ['userId']),

  // ─── OTPs ────────────────────────────────────────────────────────────────

  otps: defineTable({
    phone:          v.string(),
    otpCode:        v.string(),
    purpose:        v.string(),   // 'login' | 'registration' | 'reset'
    isUsed:         v.boolean(),
    failedAttempts: v.number(),
    expiresAt:      v.number(),   // Unix ms
    usedAt:         v.optional(v.number()),
  })
    .index('by_phone', ['phone']),

  // ─── Categories ──────────────────────────────────────────────────────────

  categories: defineTable({
    name:         v.string(),
    slug:         v.string(),
    description:  v.optional(v.string()),
    imageUrl:     v.optional(v.string()),     // legacy single image
    imageUrls:    v.array(v.string()),
    displayOrder: v.number(),
    isActive:     v.boolean(),
  })
    .index('by_slug',     ['slug'])
    .index('by_isActive', ['isActive']),

  // ─── Subcategories ────────────────────────────────────────────────────────

  subcategories: defineTable({
    categoryId:   v.id('categories'),
    name:         v.string(),
    slug:         v.string(),
    description:  v.optional(v.string()),
    imageUrl:     v.optional(v.string()),
    displayOrder: v.number(),
    isActive:     v.boolean(),
  })
    .index('by_category', ['categoryId'])
    .index('by_slug',     ['slug']),

  // ─── Products ────────────────────────────────────────────────────────────

  products: defineTable({
    categoryId:       v.id('categories'),
    subcategoryId:    v.optional(v.id('subcategories')),
    name:             v.string(),
    slug:             v.string(),
    sku:              v.string(),
    description:      v.optional(v.string()),
    basePrice:        v.number(),             // float (min of all variant prices)
    compareAtPrice:   v.optional(v.number()),
    imageUrls:        v.array(v.string()),    // max 10
    material:         v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    brand:            v.optional(v.string()),
    isActive:         v.boolean(),
    isFeatured:       v.boolean(),
    metaTitle:        v.optional(v.string()),
    metaDescription:  v.optional(v.string()),
  })
    .index('by_slug',        ['slug'])
    .index('by_sku',         ['sku'])
    .index('by_category',    ['categoryId'])
    .index('by_brand',       ['brand'])
    .index('by_isFeatured',  ['isFeatured'])
    .searchIndex('search_products', {
      searchField: 'name',
      filterFields: ['categoryId', 'isActive', 'brand'],
    }),

  // ─── Product Variants ─────────────────────────────────────────────────────

  productVariants: defineTable({
    productId:      v.id('products'),
    size:           v.string(),
    color:          v.optional(v.string()),
    sku:            v.string(),
    price:          v.number(),
    compareAtPrice: v.optional(v.number()),
    weightGrams:    v.optional(v.number()),
    isActive:       v.boolean(),
  })
    .index('by_product',             ['productId'])
    .index('by_sku',                 ['sku'])
    .index('by_product_size_color',  ['productId', 'size', 'color']),

  // ─── Inventory ────────────────────────────────────────────────────────────

  inventory: defineTable({
    variantId:        v.id('productVariants'),
    quantity:         v.number(),   // >= 0
    reservedQuantity: v.number(),   // >= 0
  })
    .index('by_variant', ['variantId']),

  // ─── Stock History ────────────────────────────────────────────────────────

  stockHistory: defineTable({
    variantId:      v.id('productVariants'),
    changeType:     v.string(),   // 'sale' | 'return' | 'adjustment' | 'purchase'
    quantityChange: v.number(),   // positive or negative
    quantityAfter:  v.number(),
    referenceType:  v.optional(v.string()),  // 'order' | 'manual'
    referenceId:    v.optional(v.string()),  // Convex ID as string
    notes:          v.optional(v.string()),
    performedBy:    v.optional(v.id('users')),
  })
    .index('by_variant', ['variantId']),

  // ─── Carts ────────────────────────────────────────────────────────────────

  carts: defineTable({
    userId: v.id('users'),
  })
    .index('by_user', ['userId']),

  // ─── Cart Items ───────────────────────────────────────────────────────────

  cartItems: defineTable({
    cartId:    v.id('carts'),
    variantId: v.id('productVariants'),
    quantity:  v.number(),   // > 0
  })
    .index('by_cart',             ['cartId'])
    .index('by_cart_and_variant', ['cartId', 'variantId']),

  // ─── Favourites ───────────────────────────────────────────────────────────

  favourites: defineTable({
    userId:    v.id('users'),
    productId: v.id('products'),
  })
    .index('by_user',             ['userId'])
    .index('by_user_and_product', ['userId', 'productId']),

  // ─── Orders ───────────────────────────────────────────────────────────────

  orders: defineTable({
    orderNumber:         v.string(),   // "ORD-XXXXXXXX"
    userId:              v.id('users'),
    status:              v.union(
                           v.literal('new'),
                           v.literal('confirmed'),
                           v.literal('shipped'),
                           v.literal('delivered'),
                           v.literal('cancelled'),
                         ),
    subtotal:            v.number(),
    promoDiscount:       v.number(),
    shippingCost:        v.number(),
    total:               v.number(),
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
    .index('by_orderNumber', ['orderNumber']),

  // ─── Order Items ──────────────────────────────────────────────────────────

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

  // ─── Payments ─────────────────────────────────────────────────────────────

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

  // ─── Shipments ────────────────────────────────────────────────────────────

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
  })
    .index('by_order',       ['orderId'])
    .index('by_consignment', ['consignmentId']),

  // ─── Promos ───────────────────────────────────────────────────────────────

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

  // ─── Promo Usages ─────────────────────────────────────────────────────────

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

  // ─── Memos ────────────────────────────────────────────────────────────────

  memos: defineTable({
    orderId:     v.id('orders'),
    memoNumber:  v.string(),
    pdfUrl:      v.optional(v.string()),  // Cloudinary URL
    memoContent: v.optional(v.string()),  // HTML or JSON
    isEdited:    v.boolean(),
  })
    .index('by_order',      ['orderId'])
    .index('by_memoNumber', ['memoNumber']),

  // ─── Pathao Tokens ────────────────────────────────────────────────────────

  pathaoTokens: defineTable({
    accessToken:  v.string(),
    tokenType:    v.string(),
    expiresIn:    v.number(),
    refreshToken: v.optional(v.string()),
    expiresAt:    v.number(),   // Unix ms
  }),

  // ─── Pathao Stores ────────────────────────────────────────────────────────

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

  // ─── Audit Logs ───────────────────────────────────────────────────────────

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

  // ─── Idempotency Keys ─────────────────────────────────────────────────────

  idempotencyKeys: defineTable({
    key:    v.string(),   // "{consignment_id}:{order_status_slug}"
    source: v.string(),   // 'pathao_webhook'
  })
    .index('by_key', ['key']),

  // ─── Daily Sales Summary ──────────────────────────────────────────────────

  dailySalesSummary: defineTable({
    summaryDate:     v.string(),   // "2026-03-09" ISO date
    totalOrders:     v.number(),
    totalRevenue:    v.number(),
    totalDiscount:   v.number(),
    totalShipping:   v.number(),
    newOrders:       v.number(),
    confirmedOrders: v.number(),
    shippedOrders:   v.number(),
    deliveredOrders: v.number(),
    cancelledOrders: v.number(),
    uniqueCustomers: v.number(),
    newCustomers:    v.number(),
  })
    .index('by_date', ['summaryDate']),

  // ─── Product Sales Summary ────────────────────────────────────────────────

  productSalesSummary: defineTable({
    productId:         v.id('products'),
    variantId:         v.optional(v.id('productVariants')),
    totalQuantitySold: v.number(),
    totalRevenue:      v.number(),
    totalOrders:       v.number(),
  })
    .index('by_product', ['productId']),

  // ─── Promo Usage Summary ──────────────────────────────────────────────────

  promoUsageSummary: defineTable({
    promoId:               v.id('promos'),
    totalUses:             v.number(),
    totalDiscountGiven:    v.number(),
    totalRevenueGenerated: v.number(),
    uniqueUsers:           v.number(),
  })
    .index('by_promo', ['promoId']),

});
