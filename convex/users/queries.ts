/**
 * Users — queries
 * Mirrors: GET /api/v1/users/me, GET /api/v1/users/addresses
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── Get current user ─────────────────────────────────────────────────────────

export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Never expose password hash
    const { passwordHash: _, ...safe } = user;
    return safe;
  },
});

// ─── List addresses for user ──────────────────────────────────────────────────

export const getAddresses = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const addresses = await ctx.db
      .query("userAddresses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Default address first, then by creation time
    return addresses.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return b._creationTime - a._creationTime;
    });
  },
});

// ─── Admin: list all users ────────────────────────────────────────────────────

export const listUsers = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    role: v.optional(v.union(v.literal("admin"), v.literal("buyer"), v.literal("seller"))),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    const all = await ctx.db.query("users").order("desc").collect();

    const filtered = args.role ? all.filter((u) => u.role === args.role) : all;

    const total = filtered.length;
    const offset = (page - 1) * pageSize;
    const items = filtered.slice(offset, offset + pageSize).map(({ passwordHash: _, ...u }) => u);

    return { items, total, page, pageSize };
  },
});
