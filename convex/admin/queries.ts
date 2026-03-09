/**
 * Admin — queries
 * Mirrors: GET /api/v1/admin/... endpoints
 * All require role === 'admin' — enforce in calling repository layer.
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── Audit logs ───────────────────────────────────────────────────────────────

export const getAuditLogs = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    userId: v.optional(v.id("users")),
    entityType: v.optional(v.string()),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    let rows = await ctx.db.query("auditLogs").order("desc").collect();

    if (args.userId) rows = rows.filter((r) => r.userId === args.userId);
    if (args.entityType) rows = rows.filter((r) => r.entityType === args.entityType);
    if (args.actionType) rows = rows.filter((r) => r.actionType === args.actionType);

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    const items = rows.slice(offset, offset + pageSize);

    return { items, total, page, pageSize };
  },
});

// ─── Get memo by order ────────────────────────────────────────────────────────

export const getMemoByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db
      .query("memos")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();
  },
});

// ─── Pending orders (admin order queue) ──────────────────────────────────────

export const getPendingOrders = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("confirmed"),
        v.literal("shipped"),
        v.literal("delivered"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;
    const status = args.status ?? "new";

    const all = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("status"), status))
      .order("desc")
      .collect();

    const total = all.length;
    const offset = (page - 1) * pageSize;
    const items = await Promise.all(
      all.slice(offset, offset + pageSize).map(async (order) => {
        const itemCount = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()
          .then((r) => r.length);
        return { ...order, itemCount };
      }),
    );

    return { items, total, page, pageSize };
  },
});

// ─── Low stock report ─────────────────────────────────────────────────────────

export const getLowStockReport = query({
  args: {
    threshold: v.optional(v.number()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.threshold ?? 5;
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    const all = await ctx.db
      .query("inventory")
      .filter((q) => q.lt(q.field("quantity"), threshold))
      .collect();

    const total = all.length;
    const offset = (page - 1) * pageSize;
    const items = await Promise.all(
      all.slice(offset, offset + pageSize).map(async (inv) => {
        const variant = await ctx.db.get(inv.variantId);
        const product = variant ? await ctx.db.get(variant.productId) : null;
        return {
          ...inv,
          variantSize: variant?.size ?? "",
          variantSku: variant?.sku ?? "",
          productName: product?.name ?? "Unknown",
          productId: variant?.productId,
        };
      }),
    );

    return { items, total, page, pageSize };
  },
});

// ─── Stock history for a variant ──────────────────────────────────────────────

export const getStockHistory = query({
  args: {
    variantId: v.id("productVariants"),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 30;

    const all = await ctx.db
      .query("stockHistory")
      .withIndex("by_variant", (q) => q.eq("variantId", args.variantId))
      .order("desc")
      .collect();

    const total = all.length;
    const offset = (page - 1) * pageSize;
    const items = all.slice(offset, offset + pageSize);

    return { items, total, page, pageSize };
  },
});
