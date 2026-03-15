import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const productTables = {
  products: defineTable({
    categoryId:       v.id('categories'),
    subcategoryId:    v.optional(v.id('subcategories')),
    brandId:          v.optional(v.id('brands')),
    name:             v.string(),
    slug:             v.string(),
    sku:              v.string(),
    description:      v.optional(v.string()),
    basePrice:        v.number(),             // float (min of all variant prices)
    compareAtPrice:   v.optional(v.number()),
    imageUrls:        v.array(v.string()),    // max 10
    material:         v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    isActive:         v.boolean(),
    isFeatured:       v.boolean(),
    trending:         v.optional(v.boolean()),
    metaTitle:        v.optional(v.string()),
    metaDescription:  v.optional(v.string()),
  })
    .index('by_slug',        ['slug'])
    .index('by_sku',         ['sku'])
    .index('by_category',    ['categoryId'])
    .index('by_brand',       ['brandId'])
    .index('by_isFeatured',  ['isFeatured'])
    .searchIndex('search_products', {
      searchField: 'name',
      filterFields: ['categoryId', 'isActive', 'brandId'],
    }),

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

  inventory: defineTable({
    variantId:        v.id('productVariants'),
    quantity:         v.number(),   // >= 0
    reservedQuantity: v.number(),   // >= 0
  })
    .index('by_variant', ['variantId']),

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
};
