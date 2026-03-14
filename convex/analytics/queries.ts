/**
 * Analytics — queries
 * Mirrors: GET /api/v1/analytics/dashboard, /daily-sales, /product-sales
 *
 * All admin-only. The caller must verify role before invoking.
 */
import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const todayStart = (() => {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })();

    const allOrders = await ctx.db.query("orders").collect();

    const todayOrders = allOrders.filter((o) => o._creationTime >= todayStart);

    const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);

    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of allOrders) {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    }

    // Recent 10 orders
    const recentOrders = allOrders
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        createdAt: o._creationTime,
        userId: o.userId,
      }));

    // Low stock warning threshold: < 5 units
    const lowStockCount = await ctx.db
      .query("inventory")
      .filter((q) => q.lt(q.field("quantity"), 5))
      .collect()
      .then((r) => r.length);

    // Total products
    const totalProducts = await ctx.db.query("products").collect().then((r) => r.length);

    // Total users
    const totalUsers = await ctx.db.query("users").collect().then((r) => r.length);

    return {
      totalOrders: allOrders.length,
      todayOrders: todayOrders.length,
      totalRevenue,
      todayRevenue,
      statusCounts,
      recentOrders,
      lowStockCount,
      totalProducts,
      totalUsers,
    };
  },
});

// ─── Daily sales (paginated) ──────────────────────────────────────────────────

export const getDailySales = query({
  args: {
    startDate: v.optional(v.string()), // "YYYY-MM-DD"
    endDate: v.optional(v.string()),   // "YYYY-MM-DD"
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 30;

    let rows = await ctx.db.query("dailySalesSummary").order("desc").collect();

    if (args.startDate) {
      rows = rows.filter((r) => r.summaryDate >= args.startDate!);
    }
    if (args.endDate) {
      rows = rows.filter((r) => r.summaryDate <= args.endDate!);
    }

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    const items = rows.slice(offset, offset + pageSize);

    return { items, total, page, pageSize };
  },
});

// ─── Product sales summary (paginated) ────────────────────────────────────────

export const getProductSales = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    let rows = args.productId
      ? await ctx.db
          .query("productSalesSummary")
          .withIndex("by_product", (q) => q.eq("productId", args.productId!))
          .collect()
      : await ctx.db.query("productSalesSummary").collect();

    // Sort by totalRevenue desc
    rows.sort((a, b) => b.totalRevenue - a.totalRevenue);

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    const items = rows.slice(offset, offset + pageSize);

    // Enrich with product name
    const enriched = await Promise.all(
      items.map(async (row) => {
        const product = await ctx.db.get(row.productId);
        const variant = row.variantId
          ? (await ctx.db.get(row.variantId)) as Doc<"productVariants"> | null
          : null;
        return {
          ...row,
          productName: product?.name ?? "Unknown",
          variantSize: variant?.size ?? "",
          variantColor: variant?.color,
          variantSku: variant?.sku ?? "",
        };
      }),
    );

    return { items: enriched, total, page, pageSize };
  },
});

// ─── Promo usage summary ──────────────────────────────────────────────────────

export const getPromoSummary = query({
  args: {
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const pageSize = args.pageSize ?? 20;

    const rows = await ctx.db.query("promoUsageSummary").collect();
    rows.sort((a, b) => b.totalDiscountGiven - a.totalDiscountGiven);

    const total = rows.length;
    const offset = (page - 1) * pageSize;
    const items = rows.slice(offset, offset + pageSize);

    const enriched = await Promise.all(
      items.map(async (row) => {
        const promo = await ctx.db.get(row.promoId);
        return {
          ...row,
          promoCode: promo?.code ?? "DELETED",
        };
      }),
    );

    return { items: enriched, total, page, pageSize };
  },
});
