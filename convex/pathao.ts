import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updateDeliveryMode = mutation({
  args: {
    orderId: v.id("orders"),
    deliveryMode: v.union(v.literal("manual"), v.literal("pathao")),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const patch: Record<string, unknown> = { deliveryMode: args.deliveryMode };
    if (args.deliveryMode === "manual") {
      patch.pathaoConsignmentId = undefined;
      patch.pathaoStatus = undefined;
      patch.pathaoPrice = undefined;
      patch.pathaoRawPayload = undefined;
    }

    await ctx.db.patch(args.orderId, patch);

    await ctx.db.insert("auditLogs", {
      userId: args.adminUserId,
      actionType: "delivery_mode_change",
      entityType: "order",
      entityId: args.orderId,
      oldValue: JSON.stringify({ deliveryMode: order.deliveryMode ?? "manual" }),
      newValue: JSON.stringify({ deliveryMode: args.deliveryMode }),
      description: `Order ${order.orderNumber}: delivery mode ${order.deliveryMode ?? "manual"} -> ${args.deliveryMode}`,
    });

    return { success: true };
  },
});

export const createPathaoParcel = mutation({
  args: {
    orderId: v.id("orders"),
    consignmentId: v.string(),
    pathaoStatus: v.string(),
    pathaoPrice: v.optional(v.number()),
    rawPayload: v.optional(v.any()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, {
      deliveryMode: "pathao",
      pathaoConsignmentId: args.consignmentId,
      pathaoStatus: args.pathaoStatus,
      pathaoPrice: args.pathaoPrice,
      pathaoRawPayload: args.rawPayload,
    });

    await ctx.db.insert("auditLogs", {
      userId: args.adminUserId,
      actionType: "create",
      entityType: "pathao_parcel",
      entityId: args.orderId,
      description: `Pathao parcel created for order ${order.orderNumber} (${args.consignmentId})`,
    });

    return { success: true };
  },
});

export const updateOrderFromWebhook = mutation({
  args: {
    consignmentId: v.string(),
    pathaoStatus: v.string(),
    rawPayload: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_consignment", (q) => q.eq("pathaoConsignmentId", args.consignmentId))
      .first();

    if (!order) return { success: true, skipped: true, reason: "order_not_found" };
    if ((order.deliveryMode ?? "manual") !== "pathao") {
      return { success: true, skipped: true, reason: "manual_order" };
    }

    const currentStatus = (order.pathaoStatus ?? "").trim().toLowerCase();
    const incomingStatus = args.pathaoStatus.trim().toLowerCase();
    if (currentStatus && currentStatus === incomingStatus) {
      return { success: true, skipped: true, reason: "status_unchanged" };
    }

    const normalized = args.pathaoStatus.toLowerCase();
    let nextOrderStatus: "new" | "confirmed" | "shipped" | "delivered" | "cancelled" | null = null;
    if (normalized.includes("created") || normalized.includes("confirmed")) {
      nextOrderStatus = "confirmed";
    } else if (normalized.includes("picked") || normalized.includes("pickup") || normalized.includes("transit")) {
      nextOrderStatus = "shipped";
    } else if (normalized.includes("delivered")) {
      nextOrderStatus = "delivered";
    } else if (normalized.includes("return") || normalized.includes("cancel")) {
      nextOrderStatus = "cancelled";
    }

    const patch: Record<string, unknown> = {
      pathaoStatus: args.pathaoStatus,
      pathaoRawPayload: args.rawPayload,
    };

    if (nextOrderStatus && order.status !== "delivered" && order.status !== "cancelled") {
      patch.status = nextOrderStatus;
      if (nextOrderStatus === "confirmed" && !order.confirmedAt) patch.confirmedAt = Date.now();
      if (nextOrderStatus === "shipped") patch.shippedAt = Date.now();
      if (nextOrderStatus === "delivered") patch.deliveredAt = Date.now();
      if (nextOrderStatus === "cancelled") patch.cancelledAt = Date.now();
    }

    await ctx.db.patch(order._id, patch);
    return { success: true, skipped: false };
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
