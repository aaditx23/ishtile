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

// ─── Get inventory by variant ─────────────────────────────────────────────────

export const getInventory = query({
  args: { variantId: v.id("productVariants") },
  handler: async (ctx, { variantId }) => {
    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", variantId))
      .first();
    
    if (!inv) return null;
    
    return {
      ...inv,
      id: inv._id,
      availableQuantity: inv.quantity - inv.reservedQuantity,
    };
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

// ─── Get admin settings ───────────────────────────────────────────────────────

export const getAdminSettings = query({
  args: {},
  handler: async (ctx) => {
    // There should only be one settings record
    const settings = await ctx.db.query("adminSettings").first();
    
    // Return defaults if no settings exist yet
    if (!settings) {
      return {
        insideDhakaShippingCost: 60,
        outsideDhakaShippingCost: 120,
      };
    }
    
    return {
      id: settings._id,
      insideDhakaShippingCost: settings.insideDhakaShippingCost,
      outsideDhakaShippingCost: settings.outsideDhakaShippingCost,
    };
  },
});

// ─── Homepage hero images ───────────────────────────────────────────────────

export const getActiveHeroImages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('heroImages')
      .withIndex('by_isActive', (q) => q.eq('isActive', true))
      .collect();

    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        id: row._id,
        url: row.url,
        title: row.title,
        subtitle: row.subtitle ?? null,
        contentPosition: row.contentPosition,
        showButton: row.showButton ?? false,
        buttonText: row.buttonText ?? null,
        buttonUrl: row.buttonUrl ?? null,
        isActive: row.isActive,
      }));
  },
});

export const listHeroImages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('heroImages').collect();

    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        id: row._id,
        url: row.url,
        title: row.title,
        subtitle: row.subtitle ?? null,
        contentPosition: row.contentPosition,
        showButton: row.showButton ?? false,
        buttonText: row.buttonText ?? null,
        buttonUrl: row.buttonUrl ?? null,
        isActive: row.isActive,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt ?? null,
      }));
  },
});
