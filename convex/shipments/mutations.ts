/**
 * Shipments — mutations
 * Mirrors: POST /api/v1/shipments (admin create) + webhook status sync
 *
 * processWebhook — called from app/api/webhooks/pathao/route.ts after HMAC
 *   verification. Uses idempotency key to prevent duplicate processing.
 *
 * createShipment — admin: manually create a shipment record for an order.
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Create shipment (admin) ──────────────────────────────────────────────────

export const createShipment = mutation({
  args: {
    orderId: v.id("orders"),
    recipientName: v.string(),
    recipientPhone: v.string(),
    recipientAddress: v.string(),
    recipientCity: v.string(),
    recipientZone: v.optional(v.string()),
    itemValue: v.number(),
    deliveryCharge: v.optional(v.number()),
    itemWeight: v.optional(v.number()),
    itemQuantity: v.optional(v.number()),
    deliveryType: v.optional(v.number()),
    specialInstructions: v.optional(v.string()),
    consignmentId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    trackingCode: v.optional(v.string()),
    merchantOrderId: v.optional(v.string()),
    pathaoStatus: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("created"), v.literal("picked_up"), v.literal("in_transit"), v.literal("delivered"), v.literal("returned"), v.literal("cancelled"))),
    createdInPathao: v.optional(v.boolean()),
    deliveryProvider: v.optional(v.string()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { orderId, adminUserId, createdInPathao, ...rest }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const existing = await ctx.db
      .query("shipments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();

    if (existing) throw new Error("Shipment already exists for this order");

    const shipmentId = await ctx.db.insert("shipments", {
      orderId,
      status: rest.status ?? "pending",
      createdInPathao: createdInPathao ?? false,
      ...rest,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "create",
      entityType: "shipment",
      entityId: shipmentId,
      description: `Shipment created for order ${order.orderNumber}`,
    });

    return shipmentId;
  },
});

// ─── Process Pathao webhook ───────────────────────────────────────────────────

export const processWebhook = mutation({
  args: {
    consignmentId: v.string(),
    status: v.string(),         // mapped internal status e.g. 'picked_up'
    pathaoStatus: v.optional(v.string()), // raw Pathao slug
    statusUpdateTime: v.optional(v.string()),
    merchantOrderId: v.optional(v.string()),
    rawPayload: v.optional(v.string()),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // ── 1. Idempotency guard ──────────────────────────────────────────────────
    const dup = await ctx.db
      .query("idempotencyKeys")
      .withIndex("by_key", (q) => q.eq("key", args.idempotencyKey))
      .first();

    if (dup) {
      return { success: true, skipped: true };
    }

    await ctx.db.insert("idempotencyKeys", {
      key: args.idempotencyKey,
      source: "pathao_webhook",
    });

    // ── 2. Find shipment ──────────────────────────────────────────────────────
    const shipment = await ctx.db
      .query("shipments")
      .filter((q) => q.eq(q.field("consignmentId"), args.consignmentId))
      .first();

    if (!shipment) {
      return { success: true, skipped: true };
    }

    // ── 3. Update shipment ────────────────────────────────────────────────────
    const now = Date.now();
    type ShipmentStatus = "pending" | "created" | "picked_up" | "in_transit" | "delivered" | "returned" | "cancelled";

    const shipPatch: Record<string, unknown> = {
      status: args.status as ShipmentStatus,
    };
    if (args.pathaoStatus)      shipPatch.pathaoStatus = args.pathaoStatus;
    if (args.statusUpdateTime)  shipPatch.statusUpdateTime = new Date(args.statusUpdateTime).getTime();
    if (args.status === "picked_up") shipPatch.pickedUpAt = now;
    if (args.status === "delivered") shipPatch.deliveredAt = now;

    await ctx.db.patch(shipment._id, shipPatch);

    // ── 4. Cascade order status ───────────────────────────────────────────────
    const order = await ctx.db.get(shipment.orderId);
    if (!order || order.status === "delivered" || order.status === "cancelled") {
      return { success: true, skipped: false };
    }

    type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
    const orderPatch: Record<string, unknown> = {};

    if (args.status === "picked_up" || args.status === "in_transit") {
      if (order.status !== "shipped") {
        orderPatch.status = "shipped" as OrderStatus;
        orderPatch.shippedAt = now;
      }
    } else if (args.status === "delivered") {
      orderPatch.status = "delivered" as OrderStatus;
      orderPatch.deliveredAt = now;

      const payment = await ctx.db
        .query("payments")
        .withIndex("by_order", (q) => q.eq("orderId", shipment.orderId))
        .first();
      if (payment) {
        await ctx.db.patch(payment._id, { status: "completed", paidAt: now });
      }
    } else if (args.status === "returned" || args.status === "cancelled") {
      orderPatch.status = "cancelled" as OrderStatus;
      orderPatch.cancelledAt = now;
    }

    if (Object.keys(orderPatch).length > 0) {
      await ctx.db.patch(shipment.orderId, orderPatch);
    }

    return { success: true, skipped: false };
  },
});

// ─── Update shipment fields ───────────────────────────────────────────────────

export const updateShipment = mutation({
  args: {
    orderId: v.id("orders"),
    consignmentId:   v.optional(v.string()),
    status:          v.optional(v.union(
                       v.literal("pending"), v.literal("created"), v.literal("picked_up"),
                       v.literal("in_transit"), v.literal("delivered"), v.literal("returned"),
                       v.literal("cancelled"),
                     )),
    deliveryCharge:  v.optional(v.number()),
    pathaoStatus:    v.optional(v.string()),
    statusUpdateTime: v.optional(v.number()),
    pickedUpAt:      v.optional(v.number()),
    deliveredAt:     v.optional(v.number()),
    errorMessage:    v.optional(v.string()),
    createdInPathao: v.optional(v.boolean()),
    trackingCode:    v.optional(v.string()),
  },
  handler: async (ctx, { orderId, ...fields }) => {
    const shipment = await ctx.db
      .query("shipments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();
    if (!shipment) throw new Error("Shipment not found");

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined),
    );
    await ctx.db.patch(shipment._id, patch);
    return shipment._id;
  },
});

// ─── Persist Pathao store to DB ───────────────────────────────────────────────

export const savePathaoStore = mutation({
  args: {
    storeId:       v.number(),
    storeName:     v.string(),
    contactNumber: v.string(),
    address:       v.string(),
    cityId:        v.number(),
    zoneId:        v.number(),
    areaId:        v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .first();
    if (!existing) {
      await ctx.db.insert("pathaoStores", { ...args, isActive: true });
    }
    return args.storeId;
  },
});

