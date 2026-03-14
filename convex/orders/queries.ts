/**
 * Orders — queries
 * Mirrors: GET /api/v1/orders (list + detail)
 * Buyers see only their own orders; admins see all.
 */
import { query } from "../_generated/server";
import { v } from "convex/values";

// ─── List orders ──────────────────────────────────────────────────────────────

export const listOrders = query({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("buyer"), v.literal("admin")),
    status: v.optional(v.string()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, { userId, role, status, page = 1, pageSize = 20 }) => {
    let orders;

    if (role === "admin") {
      orders = status
        ? await ctx.db
            .query("orders")
            .withIndex("by_status", (q) => q.eq("status", status as any))
            .order("desc")
            .collect()
        : await ctx.db.query("orders").order("desc").collect();
    } else {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();

      if (status) {
        orders = orders.filter((o) => o.status === status);
      }
    }

    const total = orders.length;
    const offset = (page - 1) * pageSize;
    const paged = orders.slice(offset, offset + pageSize);

    // Attach payment method
    const enriched = await Promise.all(
      paged.map(async (order) => {
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .first();
        const base = {
          ...order,
          id: order._id,
          paymentMethod: payment?.method ?? "cod",
          createdAt: order._creationTime,
        };

        if (role === "admin") return base;

        return {
          ...base,
          pathaoStatus: undefined,
          pathaoRawPayload: undefined,
        };
      }),
    );

    return { items: enriched, total, page, pageSize };
  },
});

// ─── Get order by ID ──────────────────────────────────────────────────────────

export const getOrderById = query({
  args: {
    orderId: v.id("orders"),
    userId: v.id("users"),
    role: v.union(v.literal("buyer"), v.literal("admin")),
  },
  handler: async (ctx, { orderId, userId, role }) => {
    const order = await ctx.db.get(orderId);
    if (!order) return null;

    // Non-admins can only see their own orders
    if (role !== "admin" && order.userId !== userId) return null;

    const [items, payment, shipment] = await Promise.all([
      ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .collect(),
      ctx.db
        .query("payments")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .first(),
      ctx.db
        .query("shipments")
        .withIndex("by_order", (q) => q.eq("orderId", orderId))
        .first(),
    ]);

    const result = {
      ...order,
      id: order._id,
      createdAt: order._creationTime,
      paymentMethod: payment?.method ?? "cod",
      paymentStatus: payment?.status ?? "pending",
      items: items.map((item) => ({ ...item, id: item._id })),
      shipment: shipment ? { ...shipment, id: shipment._id } : null,
    };

    if (role === "admin") return result;

    return {
      ...result,
      pathaoStatus: undefined,
      pathaoRawPayload: undefined,
    };
  },
});

export const getOrderByConsignmentId = query({
  args: {
    consignmentId: v.string(),
  },
  handler: async (ctx, { consignmentId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_consignment", (q) => q.eq("pathaoConsignmentId", consignmentId))
      .first();
  },
});

export const getOrderByOrderNumber = query({
  args: {
    orderNumber: v.string(),
  },
  handler: async (ctx, { orderNumber }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", orderNumber))
      .first();
  },
});

export const getCheckoutShippingCost = query({
  args: {
    shippingCity: v.string(),
  },
  handler: async (ctx, { shippingCity }) => {
    const settings = await ctx.db.query("adminSettings").first();

    const insideDhakaFee = settings?.insideDhakaShippingCost ?? 60;
    const outsideDhakaFee = settings?.outsideDhakaShippingCost ?? 120;
    const normalizedCity = shippingCity.trim().toLowerCase();
    const shippingCost = normalizedCity === "dhaka" ? insideDhakaFee : outsideDhakaFee;

    return {
      insideDhakaFee,
      outsideDhakaFee,
      shippingCost,
    };
  },
});
