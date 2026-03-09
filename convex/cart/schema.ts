import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const cartTables = {
  carts: defineTable({
    userId: v.id('users'),
  })
    .index('by_user', ['userId']),

  cartItems: defineTable({
    cartId:    v.id('carts'),
    variantId: v.id('productVariants'),
    quantity:  v.number(),   // > 0
  })
    .index('by_cart',             ['cartId'])
    .index('by_cart_and_variant', ['cartId', 'variantId']),
};
