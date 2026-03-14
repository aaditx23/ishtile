/**
 * Shipments — queries
 * Mirrors: GET /api/v1/shipments/{orderId}
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

export const getShipment = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db
      .query("shipments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();
  },
});

export const listShipments = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    let all = await ctx.db.query("shipments").order("desc").collect();
    if (args.status) all = all.filter((s) => s.status === args.status);

    const total = all.length;
    const offset = (page - 1) * pageSize;
    const items = all.slice(offset, offset + pageSize);

    return { items, total, page, pageSize };
  },
});

export const getActivePathaoStore = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("pathaoStores")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .first();
  },
});

export const getPathaoStoreByStoreId = query({
  args: {
    storeId: v.number(),
  },
  handler: async (ctx, { storeId }) => {
    return await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .first();
  },
});
