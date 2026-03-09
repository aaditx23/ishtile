import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authTables = {
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
};
