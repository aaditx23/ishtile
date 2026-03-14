// Allowed order statuses for type safety
type OrderStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "shipped"
  | "delivered"
  | "cancelled";
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

async function ensureAdmin(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") throw new Error("Admin access required");
}

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
    consignmentId: v.optional(v.string()),
    invoiceNumber: v.optional(v.string()),
    trackingCode: v.optional(v.string()),
    merchantOrderId: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("created"), v.literal("picked_up"), v.literal("in_transit"), v.literal("delivered"), v.literal("returned"), v.literal("cancelled"))),
    createdInPathao: v.optional(v.boolean()),
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
    status: v.string(),
    statusUpdateTime: v.optional(v.string()),
    merchantOrderId: v.optional(v.string()),
    rawPayload: v.optional(v.string()),
    idempotencyKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency check — skip duplicate webhooks
    const dup = await ctx.db
      .query("idempotencyKeys")
      .withIndex("by_key", (q) => q.eq("key", args.idempotencyKey))
      .first();

    if (dup) {
      return { success: true, skipped: true };
    }

    // Register idempotency key
    await ctx.db.insert("idempotencyKeys", {
      key: args.idempotencyKey,
      source: "pathao_webhook",
    });

    // Find shipment by consignmentId
    const shipment = await ctx.db
      .query("shipments")
      .filter((q) => q.eq(q.field("consignmentId"), args.consignmentId))
      .first();

    if (!shipment) {
      // May arrive before shipment record created — silently ack
      return { success: true, skipped: true };
    }

    type ShipmentStatus = "pending" | "created" | "picked_up" | "in_transit" | "delivered" | "returned" | "cancelled";
    await ctx.db.patch(shipment._id, {
      status: args.status as ShipmentStatus,
    });

    // Mirror order status based on Pathao event
    const pathaoToOrderStatus: Record<string, OrderStatus> = {
      Delivered: "delivered",
      "Partially Delivered": "delivered",
      Returned: "cancelled",
      "Return Initiated": "cancelled",
    };

    const orderStatus = pathaoToOrderStatus[args.status];
    if (orderStatus) {
      const order = await ctx.db.get(shipment.orderId);
      if (
        order &&
        order.status !== "delivered" &&
        order.status !== "cancelled"
      ) {
        await ctx.db.patch(order._id, {
          status: orderStatus,
          ...(orderStatus === "delivered" && { deliveredAt: Date.now() }),
          ...(orderStatus === "cancelled" && { cancelledAt: Date.now() }),
        });
      }
    }

    return { success: true, skipped: false };
  },
});

export const upsertPathaoStore = mutation({
  args: {
    storeId: v.number(),
    name: v.string(),
    cityId: v.number(),
    zoneId: v.number(),
    areaId: v.number(),
    contactNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .first();

    const payload = {
      storeId: args.storeId,
      name: args.name,
      storeName: args.name,
      contactNumber: args.contactNumber ?? "",
      address: args.address ?? "",
      cityId: args.cityId,
      zoneId: args.zoneId,
      areaId: args.areaId,
      isActive: args.isActive ?? true,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { success: true, id: existing._id };
    }

    const id = await ctx.db.insert("pathaoStores", payload);
    return { success: true, id };
  },
});

export const createPathaoStoreRecord = mutation({
  args: {
    storeId: v.number(),
    storeName: v.string(),
    contactNumber: v.string(),
    address: v.string(),
    cityId: v.number(),
    zoneId: v.number(),
    areaId: v.number(),
    isActive: v.optional(v.boolean()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.adminUserId);

    const existing = await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .first();

    const allStores = await ctx.db.query("pathaoStores").collect();
    const shouldBeActive = args.isActive ?? allStores.length === 0;

    if (shouldBeActive) {
      for (const store of allStores) {
        if (store.isActive) {
          await ctx.db.patch(store._id, { isActive: false });
        }
      }
    }

    const payload = {
      storeId: args.storeId,
      name: args.storeName,
      storeName: args.storeName,
      contactNumber: args.contactNumber,
      address: args.address,
      cityId: args.cityId,
      zoneId: args.zoneId,
      areaId: args.areaId,
      isActive: shouldBeActive,
      createdAt: existing?.createdAt ?? Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return { success: true, id: existing._id };
    }

    const id = await ctx.db.insert("pathaoStores", payload);
    return { success: true, id };
  },
});

export const updatePathaoStore = mutation({
  args: {
    storeId: v.number(),
    storeName: v.string(),
    contactNumber: v.string(),
    address: v.string(),
    cityId: v.number(),
    zoneId: v.number(),
    areaId: v.number(),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ensureAdmin(ctx, args.adminUserId);

    const existing = await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", args.storeId))
      .first();
    if (!existing) throw new Error("Store not found");

    await ctx.db.patch(existing._id, {
      name: args.storeName,
      storeName: args.storeName,
      contactNumber: args.contactNumber,
      address: args.address,
      cityId: args.cityId,
      zoneId: args.zoneId,
      areaId: args.areaId,
    });

    return { success: true };
  },
});

export const setActivePathaoStore = mutation({
  args: {
    storeId: v.number(),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { storeId, adminUserId }) => {
    await ensureAdmin(ctx, adminUserId);

    const target = await ctx.db
      .query("pathaoStores")
      .withIndex("by_storeId", (q) => q.eq("storeId", storeId))
      .first();
    if (!target) throw new Error("Store not found");

    const allStores = await ctx.db.query("pathaoStores").collect();
    for (const store of allStores) {
      const nextActive = store.storeId === storeId;
      if (store.isActive !== nextActive) {
        await ctx.db.patch(store._id, { isActive: nextActive });
      }
    }

    return { success: true };
  },
});
