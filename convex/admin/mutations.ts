/**
 * Admin — mutations
 * Mirrors: POST/PATCH /api/v1/admin/... endpoints
 *
 * Note: PDF generation + Cloudinary upload is handled by the Next.js Route Handler
 * at app/api/admin/memos/generate/[orderId]/route.ts — which uploads the PDF and
 * calls upsertMemo with the resulting pdfUrl.  These mutations only manage the DB.
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

// ─── Upsert memo record ───────────────────────────────────────────────────────

export const upsertMemo = mutation({
  args: {
    orderId: v.id("orders"),
    pdfUrl: v.optional(v.string()),
    memoContent: v.optional(v.string()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { orderId, pdfUrl, memoContent, adminUserId }) => {
    const order = await ctx.db.get(orderId);
    if (!order) throw new Error("Order not found");

    const existing = await ctx.db
      .query("memos")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(memoContent !== undefined && { memoContent }),
        isEdited: true,
      });
      return { memoId: existing._id, isNew: false };
    } else {
      const memoNumber = `MEMO-${Date.now().toString(36).toUpperCase().slice(-8)}`;
      const memoId = await ctx.db.insert("memos", {
        orderId,
        memoNumber,
        pdfUrl,
        memoContent,
        isEdited: false,
      });

      await ctx.db.insert("auditLogs", {
        userId: adminUserId,
        actionType: "create",
        entityType: "memo",
        entityId: memoId,
        description: `Memo created for order ${order.orderNumber}`,
      });

      return { memoId, isNew: true };
    }
  },
});

// ─── Delete memo ──────────────────────────────────────────────────────────────

export const deleteMemo = mutation({
  args: {
    memoId: v.id("memos"),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { memoId, adminUserId }) => {
    const memo = await ctx.db.get(memoId);
    if (!memo) throw new Error("Memo not found");

    await ctx.db.delete(memoId);

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "delete",
      entityType: "memo",
      entityId: memoId,
      description: `Memo for order ${memo.orderId} deleted`,
    });

    return { success: true };
  },
});

// ─── Manually adjust inventory (admin) ───────────────────────────────────────

export const adjustInventory = mutation({
  args: {
    variantId: v.id("productVariants"),
    newQuantity: v.number(),
    note: v.optional(v.string()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { variantId, newQuantity, note, adminUserId }) => {
    if (newQuantity < 0) throw new Error("Quantity cannot be negative");

    const inv = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", variantId))
      .first();

    if (!inv) throw new Error("Inventory record not found for this variant");

    const oldQty = inv.quantity;
    await ctx.db.patch(inv._id, { quantity: newQuantity });

    await ctx.db.insert("stockHistory", {
      variantId,
      changeType: "admin_adjust",
      quantityChange: newQuantity - oldQty,
      quantityAfter: newQuantity,
      performedBy: adminUserId,
      notes: note ?? "Manual admin adjustment",
    });

    return { success: true, oldQuantity: oldQty, newQuantity };
  },
});

// ─── Update user role (admin) ─────────────────────────────────────────────────

export const updateUserRole = mutation({
  args: {
    targetUserId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("buyer")),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { targetUserId, role, adminUserId }) => {
    const user = await ctx.db.get(targetUserId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(targetUserId, { role });

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "update",
      entityType: "user",
      entityId: targetUserId,
      oldValue: JSON.stringify({ role: user.role }),
      newValue: JSON.stringify({ role }),
      description: `User ${user.phone ?? user.email} role changed: ${user.role} → ${role}`,
    });

    return { success: true };
  },
});

// ─── Toggle user active status (admin) ───────────────────────────────────────

export const setUserActive = mutation({
  args: {
    targetUserId: v.id("users"),
    isActive: v.boolean(),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { targetUserId, isActive, adminUserId }) => {
    const user = await ctx.db.get(targetUserId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(targetUserId, { isActive });

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "update",
      entityType: "user",
      entityId: targetUserId,
      description: `User ${user.phone ?? user.email} ${isActive ? "activated" : "deactivated"}`,
    });

    return { success: true };
  },
});

// ─── Update admin settings ────────────────────────────────────────────────────

export const updateAdminSettings = mutation({
  args: {
    insideDhakaShippingCost: v.optional(v.number()),
    outsideDhakaShippingCost: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get existing settings or create new one
    const existing = await ctx.db.query("adminSettings").first();
    
    if (existing) {
      // Update existing settings
      const updates: Record<string, number> = {};
      if (args.insideDhakaShippingCost !== undefined) {
        updates.insideDhakaShippingCost = args.insideDhakaShippingCost;
      }
      if (args.outsideDhakaShippingCost !== undefined) {
        updates.outsideDhakaShippingCost = args.outsideDhakaShippingCost;
      }
      
      await ctx.db.patch(existing._id, updates);
      return { id: existing._id };
    } else {
      // Create new settings with defaults
      const id = await ctx.db.insert("adminSettings", {
        insideDhakaShippingCost: args.insideDhakaShippingCost ?? 60,
        outsideDhakaShippingCost: args.outsideDhakaShippingCost ?? 120,
      });
      return { id };
    }
  },
});

// ─── Idempotency helpers ─────────────────────────────────────────────────────

export const reserveIdempotencyKey = mutation({
  args: {
    key: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, { key, source }) => {
    const existing = await ctx.db
      .query("idempotencyKeys")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      return { reserved: false };
    }

    await ctx.db.insert("idempotencyKeys", {
      key,
      source: source ?? "pathao_webhook",
    });

    return { reserved: true };
  },
});

// ─── Homepage hero images ─────────────────────────────────────────────────

export const createHeroImage = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    contentPosition: v.union(v.literal('left'), v.literal('right')),
    showButton: v.optional(v.boolean()),
    buttonText: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('heroImages', {
      url: args.url,
      title: args.title,
      subtitle: args.subtitle,
      contentPosition: args.contentPosition,
      showButton: args.showButton ?? false,
      buttonText: args.buttonText,
      buttonUrl: args.buttonUrl,
      isActive: args.isActive,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { id };
  },
});

export const updateHeroImage = mutation({
  args: {
    heroImageId: v.id('heroImages'),
    url: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    contentPosition: v.union(v.literal('left'), v.literal('right')),
    showButton: v.optional(v.boolean()),
    buttonText: v.optional(v.string()),
    buttonUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.heroImageId);
    if (!existing) throw new Error('Hero image not found');

    await ctx.db.patch(args.heroImageId, {
      url: args.url,
      title: args.title,
      subtitle: args.subtitle,
      contentPosition: args.contentPosition,
      showButton: args.showButton ?? false,
      buttonText: args.buttonText,
      buttonUrl: args.buttonUrl,
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const setHeroImageActive = mutation({
  args: {
    heroImageId: v.id('heroImages'),
    isActive: v.boolean(),
  },
  handler: async (ctx, { heroImageId, isActive }) => {
    const existing = await ctx.db.get(heroImageId);
    if (!existing) throw new Error('Hero image not found');

    await ctx.db.patch(heroImageId, {
      isActive,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const deleteHeroImage = mutation({
  args: {
    heroImageId: v.id('heroImages'),
  },
  handler: async (ctx, { heroImageId }) => {
    const existing = await ctx.db.get(heroImageId);
    if (!existing) throw new Error('Hero image not found');

    await ctx.db.delete(heroImageId);
    return { success: true };
  },
});
