/**
 * Users — mutations
 * Mirrors: PATCH /api/v1/users/me, POST/PATCH/DELETE /api/v1/users/addresses
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Update my profile ────────────────────────────────────────────────────────

export const updateMe = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...patch }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const normalizedUsername = patch.username?.trim();
    if (normalizedUsername && normalizedUsername.length > 10) {
      throw new Error("Username must be within 10 characters");
    }

    if (patch.email && patch.email !== user.email) {
      const dup = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", patch.email!))
        .first();
      if (dup) throw new Error("Email is already in use");
    }

    if (normalizedUsername && normalizedUsername !== user.username) {
      const dup = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
        .first();
      if (dup) throw new Error("Username is already taken");
    }

    const cleaned: Record<string, unknown> = {};
    if (patch.fullName !== undefined) cleaned.fullName = patch.fullName;
    if (patch.email !== undefined) cleaned.email = patch.email;
    if (patch.username !== undefined) cleaned.username = normalizedUsername;

    await ctx.db.patch(userId, cleaned);
    return { success: true };
  },
});

// ─── Create address ───────────────────────────────────────────────────────────

export const createAddress = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    phone: v.string(),
    addressLine: v.optional(v.string()),
    city: v.string(),
    postalCode: v.optional(v.string()),
    cityId: v.optional(v.number()),
    zoneId: v.optional(v.number()),
    areaId: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, isDefault, addressLine, ...rest }) => {
    const shouldDefault = isDefault ?? false;

    if (shouldDefault) {
      // Clear existing defaults for this user
      const existing = await ctx.db
        .query("userAddresses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .collect();

      for (const addr of existing) {
        await ctx.db.patch(addr._id, { isDefault: false });
      }
    }

    const addressId = await ctx.db.insert("userAddresses", {
      userId,
      isDefault: shouldDefault,
      addressLine: addressLine ?? "",
      ...rest,
    });

    return addressId;
  },
});

// ─── Update address ───────────────────────────────────────────────────────────

export const updateAddress = mutation({
  args: {
    addressId: v.id("userAddresses"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    cityId: v.optional(v.number()),
    zoneId: v.optional(v.number()),
    areaId: v.optional(v.number()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, { addressId, userId, isDefault, ...rest }) => {
    const address = await ctx.db.get(addressId);
    if (!address) throw new Error("Address not found");
    if (address.userId !== userId) throw new Error("Forbidden");

    if (isDefault === true) {
      // Remove default from all others for this user
      const others = await ctx.db
        .query("userAddresses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .collect();

      for (const addr of others) {
        if (addr._id !== addressId) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    const patch: Record<string, unknown> = { ...rest };
    if (isDefault !== undefined) patch.isDefault = isDefault;

    await ctx.db.patch(addressId, patch);
    return { success: true };
  },
});

// ─── Delete address ───────────────────────────────────────────────────────────

export const deleteAddress = mutation({
  args: {
    addressId: v.id("userAddresses"),
    userId: v.id("users"),
  },
  handler: async (ctx, { addressId, userId }) => {
    const address = await ctx.db.get(addressId);
    if (!address) throw new Error("Address not found");
    if (address.userId !== userId) throw new Error("Forbidden");

    await ctx.db.delete(addressId);
    return { success: true };
  },
});
