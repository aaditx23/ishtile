/**
 * Orders — mutations
 * Mirrors: POST /api/v1/orders (create) + PATCH /api/v1/orders/{id}/status (admin)
 *
 * createOrder — full atomic order placement:
 *   cart validation → stock check → promo → payment → stock deduction → cart clear
 *
 * updateOrderStatus — state machine:
 *   new → confirmed → shipped → delivered
 *   any → cancelled (restores stock + reverts promo)
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { deductStockHelper, restoreStockHelper } from "../_internal/inventory";
import {
  validateAndCalculateHelper,
  applyPromoHelper,
  revertPromoHelper,
} from "../_internal/promoEngine";

const FIXED_SHIPPING_COST = 50; // BDT — same as Python backend default

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const suffix = Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `ORD-${suffix}`;
}

// ─── Create order ─────────────────────────────────────────────────────────────

export const createOrder = mutation({
  args: {
    userId: v.id("users"),
    promoCode: v.optional(v.string()),
    shippingName: v.string(),
    shippingPhone: v.string(),
    shippingAddress: v.string(),
    shippingCity: v.string(),
    shippingPostalCode: v.optional(v.string()),
    shippingAddressLine: v.optional(v.string()),
    shippingCityId: v.optional(v.number()),
    shippingZoneId: v.optional(v.number()),
    shippingAreaId: v.optional(v.number()),
    customerNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, promoCode, ...shippingFields } = args;

    // ── 1. Load cart ──────────────────────────────────────────────────────────
    const cart = await ctx.db
      .query("carts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!cart) throw new Error("Cart is empty");

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_cart", (q) => q.eq("cartId", cart._id))
      .collect();

    if (!cartItems.length) throw new Error("Cart is empty");

    // ── 2. Stock validation — adjust cart if needed ───────────────────────────
    // (Convex mutations are serialized — no SELECT FOR UPDATE needed)
    let cartModified = false;
    const itemsToDelete: (typeof cartItems)[number][] = [];
    const validatedItems: {
      item: (typeof cartItems)[number];
      variantId: (typeof cartItems)[number]["variantId"];
      quantity: number;
    }[] = [];

    for (const item of cartItems) {
      const inv = await ctx.db
        .query("inventory")
        .withIndex("by_variant", (q) => q.eq("variantId", item.variantId))
        .first();

      const stock = inv?.quantity ?? 0;

      if (stock === 0) {
        itemsToDelete.push(item);
        cartModified = true;
      } else if (item.quantity > stock) {
        await ctx.db.patch(item._id, { quantity: stock });
        validatedItems.push({ item, variantId: item.variantId, quantity: stock });
        cartModified = true;
      } else {
        validatedItems.push({ item, variantId: item.variantId, quantity: item.quantity });
      }
    }

    for (const item of itemsToDelete) {
      await ctx.db.delete(item._id);
    }

    if (cartModified) {
      return {
        success: false,
        message: "Some products are low on stock or unavailable",
        cartUpdated: true,
      };
    }

    // ── 3. Load variant/product snapshots for order items ─────────────────────
    const itemSnapshots = await Promise.all(
      validatedItems.map(async ({ variantId, quantity }) => {
        const variant = await ctx.db.get(variantId);
        if (!variant) throw new Error(`Variant ${variantId} not found`);
        const product = await ctx.db.get(variant.productId);
        if (!product) throw new Error(`Product for variant ${variantId} not found`);

        return { variant, product, quantity };
      }),
    );

    // ── 4. Calculate subtotal ────────────────────────────────────────────────
    const subtotal = itemSnapshots.reduce(
      (sum, { variant, quantity }) => sum + variant.price * quantity,
      0,
    );

    // ── 5. Validate promo ────────────────────────────────────────────────────
    let promoDiscount = 0;
    let promoResult: Awaited<ReturnType<typeof validateAndCalculateHelper>> | null = null;

    if (promoCode) {
      promoResult = await validateAndCalculateHelper(ctx, promoCode, userId, subtotal);
      if (!promoResult.isValid) {
        throw new Error(promoResult.message);
      }
      promoDiscount = promoResult.discount;
    }

    // ── 6. Calculate total ───────────────────────────────────────────────────
    const shippingCost = FIXED_SHIPPING_COST;
    const total = subtotal - promoDiscount + shippingCost;

    // ── 7. Create order ──────────────────────────────────────────────────────
    const orderNumber = generateOrderNumber();

    const orderId = await ctx.db.insert("orders", {
      orderNumber,
      userId,
      status: "new",
      subtotal,
      promoDiscount,
      shippingCost,
      total,
      isPaid: false,
      ...shippingFields,
    });

    // ── 8. Create order items + deduct stock ─────────────────────────────────
    for (const { variant, product, quantity } of itemSnapshots) {
      await ctx.db.insert("orderItems", {
        orderId,
        variantId: variant._id,
        productName: product.name,
        variantSize: variant.size,
        variantColor: variant.color,
        variantSku: variant.sku,
        unitPrice: variant.price,
        quantity,
        lineTotal: variant.price * quantity,
      });

      await deductStockHelper(ctx, variant._id, quantity, orderId, userId);
    }

    // ── 9. Apply promo (increment usage counter) ─────────────────────────────
    if (promoCode && promoResult?.isValid) {
      await applyPromoHelper(ctx, promoCode, userId, orderId, promoDiscount);
    }

    // ── 10. Create payment record (COD) ──────────────────────────────────────
    await ctx.db.insert("payments", {
      orderId,
      method: "cod",
      status: "pending",
      amount: total,
      isWebhookProcessed: false,
    });

    // ── 11. Clear cart ───────────────────────────────────────────────────────
    for (const { item } of validatedItems) {
      await ctx.db.delete(item._id);
    }

    // ── 12. Auto-save address (best-effort) ──────────────────────────────────
    if (shippingFields.shippingAddressLine && shippingFields.shippingCity) {
      const dup = await ctx.db
        .query("userAddresses")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) =>
          q.and(
            q.eq(q.field("addressLine"), shippingFields.shippingAddressLine!),
            q.eq(q.field("city"), shippingFields.shippingCity),
          ),
        )
        .first();

      if (!dup) {
        await ctx.db.insert("userAddresses", {
          userId,
          name: shippingFields.shippingName,
          phone: shippingFields.shippingPhone,
          addressLine: shippingFields.shippingAddressLine,
          city: shippingFields.shippingCity,
          postalCode: shippingFields.shippingPostalCode,
          cityId: shippingFields.shippingCityId,
          zoneId: shippingFields.shippingZoneId,
          areaId: shippingFields.shippingAreaId,
          isDefault: false,
        });
      }
    }

    return { success: true, orderId, orderNumber };
  },
});

// ─── Update order status (admin) ──────────────────────────────────────────────

const ORDER_STATUS_VALUES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("new"),
      v.literal("confirmed"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled"),
    ),
    adminNotes: v.optional(v.string()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { orderId, status, adminNotes, adminUserId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const oldStatus = order.status;

    // Basic state machine validation
    if (oldStatus === "delivered" || oldStatus === "cancelled") {
      throw new Error(`Cannot change status of a ${oldStatus} order`);
    }

    const now = Date.now();
    const patch: Record<string, unknown> = { status };

    if (adminNotes !== undefined) patch.adminNotes = adminNotes;

    switch (status) {
      case "confirmed":
        patch.confirmedAt = now;
        break;
      case "shipped":
        patch.shippedAt = now;
        break;
      case "delivered":
        patch.deliveredAt = now;
        // Mark payment as completed for COD
        const payment = await ctx.db
          .query("payments")
          .withIndex("by_order", (q) => q.eq("orderId", orderId))
          .first();
        if (payment && payment.method === "cod") {
          await ctx.db.patch(payment._id, { status: "completed", paidAt: now });
        }
        break;
      case "cancelled":
        patch.cancelledAt = now;
        // Restore stock for each order item
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", orderId))
          .collect();
        for (const item of items) {
          await restoreStockHelper(ctx, item.variantId, item.quantity, orderId, adminUserId);
        }
        // Revert promo usage if any
        await revertPromoHelper(ctx, orderId);
        break;
    }

    await ctx.db.patch(orderId, patch);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "status_change",
      entityType: "order",
      entityId: orderId,
      oldValue: JSON.stringify({ status: oldStatus }),
      newValue: JSON.stringify({ status }),
      description: `Order ${order.orderNumber}: ${oldStatus} → ${status}`,
    });

    // Analytics update when confirmed (update daily + product summaries)
    if (status === "confirmed" && oldStatus === "new") {
      await updateDailySummaryHelper(ctx, now);
      await updateProductSummaryHelper(ctx, orderId);
    }

    return { success: true };
  },
});

// ─── Inline analytics helpers (avoid circular imports) ───────────────────────

async function updateDailySummaryHelper(ctx: any, timestampMs: number) {
  const date = new Date(timestampMs);
  const summaryDate = date.toISOString().split("T")[0]; // "2026-03-09"

  // All orders for today
  const dayStart = new Date(summaryDate + "T00:00:00.000Z").getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;

  const todayOrders = await ctx.db
    .query("orders")
    .filter((q: any) =>
      q.and(
        q.gte(q.field("_creationTime"), dayStart),
        q.lt(q.field("_creationTime"), dayEnd),
      ),
    )
    .collect();

  const totalOrders = todayOrders.length;
  const totalRevenue = todayOrders.reduce((s: number, o: any) => s + o.total, 0);
  const totalDiscount = todayOrders.reduce((s: number, o: any) => s + o.promoDiscount, 0);
  const totalShipping = todayOrders.reduce((s: number, o: any) => s + o.shippingCost, 0);

  const statusCounts = { new: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const o of todayOrders) (statusCounts as any)[o.status]++;

  const uniqueCustomers = new Set(todayOrders.map((o: any) => o.userId)).size;

  const existing = await ctx.db
    .query("dailySalesSummary")
    .withIndex("by_date", (q: any) => q.eq("summaryDate", summaryDate))
    .first();

  const summaryData = {
    summaryDate,
    totalOrders,
    totalRevenue,
    totalDiscount,
    totalShipping,
    newOrders: statusCounts.new,
    confirmedOrders: statusCounts.confirmed,
    shippedOrders: statusCounts.shipped,
    deliveredOrders: statusCounts.delivered,
    cancelledOrders: statusCounts.cancelled,
    uniqueCustomers,
    newCustomers: 0,
  };

  if (existing) {
    await ctx.db.patch(existing._id, summaryData);
  } else {
    await ctx.db.insert("dailySalesSummary", summaryData);
  }
}

async function updateProductSummaryHelper(ctx: any, orderId: any) {
  const items = await ctx.db
    .query("orderItems")
    .withIndex("by_order", (q: any) => q.eq("orderId", orderId))
    .collect();

  for (const item of items) {
    const variant = await ctx.db.get(item.variantId);
    if (!variant) continue;

    const existing = await ctx.db
      .query("productSalesSummary")
      .withIndex("by_product", (q: any) => q.eq("productId", variant.productId))
      .filter((q: any) => q.eq(q.field("variantId"), item.variantId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalQuantitySold: existing.totalQuantitySold + item.quantity,
        totalRevenue: existing.totalRevenue + item.lineTotal,
        totalOrders: existing.totalOrders + 1,
      });
    } else {
      await ctx.db.insert("productSalesSummary", {
        productId: variant.productId,
        variantId: item.variantId,
        totalQuantitySold: item.quantity,
        totalRevenue: item.lineTotal,
        totalOrders: 1,
      });
    }
  }
}
