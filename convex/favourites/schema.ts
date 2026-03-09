import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const favouriteTables = {
  favourites: defineTable({
    userId:    v.id('users'),
    productId: v.id('products'),
  })
    .index('by_user',             ['userId'])
    .index('by_user_and_product', ['userId', 'productId']),
};
