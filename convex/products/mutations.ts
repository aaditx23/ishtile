/**
 * Products — admin mutations
 * Mirrors: POST/PUT/DELETE /api/v1/products (admin only)
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { adjustStockHelper } from "../_internal/inventory";

const variantArgs = v.object({
  size: v.string(),
  color: v.optional(v.string()),
  sku: v.string(),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  weightGrams: v.optional(v.number()),
  quantity: v.optional(v.number()), // initial inventory
});

// ─── Create product ───────────────────────────────────────────────────────────
// Mirrors: create_product in products.py
// uploadedImageUrls already uploaded to Cloudinary before calling this.

export const createProduct = mutation({
  args: {
    categoryId: v.id("categories"),
    subcategoryId: v.optional(v.id("subcategories")),
    brandId: v.optional(v.id("brands")),
    name: v.string(),
    sku: v.string(),
    description: v.optional(v.string()),
    imageUrls: v.array(v.string()),
    material: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    compareAtPrice: v.optional(v.number()),
    variants: v.array(variantArgs),
    adminUserId: v.id("users"),
  },
  handler: async (
    ctx,
    { adminUserId, variants, name, sku, imageUrls, ...productFields },
  ) => {
    if (!variants.length) throw new Error("At least one variant is required");

    // Check SKU uniqueness
    const skuDup = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", sku))
      .first();
    if (skuDup) throw new Error(`SKU "${sku}" is already in use`);

    // Generate unique slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Derive basePrice from min variant price
    const basePrice = Math.min(...variants.map((v) => v.price));

    const productId = await ctx.db.insert("products", {
      ...productFields,
      name,
      imageUrls,
      slug,
      sku,
      basePrice,
      isActive: productFields.isActive ?? true,
      isFeatured: productFields.isFeatured ?? false,
    });

    // Create variants + inventory
    for (const variantData of variants) {
      const { quantity = 0, ...variantFields } = variantData;

      const variantId = await ctx.db.insert("productVariants", {
        ...variantFields,
        productId,
        isActive: true,
      });

      await ctx.db.insert("inventory", {
        variantId,
        quantity,
        reservedQuantity: 0,
      });
    }

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "create",
      entityType: "product",
      entityId: productId,
      description: `Created product: ${name}`,
    });

    return { id: productId };
  },
});

// ─── Update product ───────────────────────────────────────────────────────────

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    adminUserId: v.id("users"),
    name: v.optional(v.string()),
    sku: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrls: v.optional(v.array(v.string())),
    material: v.optional(v.string()),
    careInstructions: v.optional(v.string()),
    brandId: v.optional(v.id("brands")),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    basePrice: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subcategories")),
  },
  handler: async (ctx, { id, adminUserId, sku, ...fields }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");

    if (sku !== undefined && sku !== product.sku) {
      const dup = await ctx.db
        .query("products")
        .withIndex("by_sku", (q) => q.eq("sku", sku))
        .first();
      if (dup) throw new Error(`SKU "${sku}" is already in use`);
    }

    const patch = Object.fromEntries(
      Object.entries({ sku, ...fields }).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "update",
      entityType: "product",
      entityId: id,
      description: `Updated product: ${product.name}`,
    });

    return { id };
  },
});

// ─── Update product images ────────────────────────────────────────────────────

export const updateProductImages = mutation({
  args: {
    id: v.id("products"),
    imageUrls: v.array(v.string()),
    replace: v.optional(v.boolean()), // true = replace list, false = append
  },
  handler: async (ctx, { id, imageUrls, replace = true }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");

    let final: string[];
    if (replace) {
      final = imageUrls;
    } else {
      // Append, deduplicate
      const existing = product.imageUrls ?? [];
      final = [...new Set([...existing, ...imageUrls])];
    }

    await ctx.db.patch(id, { imageUrls: final });
    return { id };
  },
});

// ─── Delete product ───────────────────────────────────────────────────────────

export const deleteProduct = mutation({
  args: {
    id: v.id("products"),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { id, adminUserId }) => {
    const product = await ctx.db.get(id);
    if (!product) throw new Error("Product not found");

    await ctx.db.delete(id);

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "delete",
      entityType: "product",
      entityId: id,
      description: `Deleted product: ${product.name}`,
    });

    return { success: true };
  },
});

// ─── Update variant ───────────────────────────────────────────────────────────

export const updateVariant = mutation({
  args: {
    id: v.id("productVariants"),
    adminUserId: v.id("users"),
    size: v.optional(v.string()),
    color: v.optional(v.string()),
    sku: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    weightGrams: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, adminUserId, ...fields }) => {
    const variant = await ctx.db.get(id);
    if (!variant) throw new Error("Variant not found");

    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );
    await ctx.db.patch(id, patch);

    // Recalculate product basePrice if price changed
    if (fields.price !== undefined) {
      const allVariants = await ctx.db
        .query("productVariants")
        .withIndex("by_product", (q) => q.eq("productId", variant.productId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const basePrice = allVariants.length
        ? Math.min(...allVariants.map((v) => (v._id === id ? fields.price! : v.price)))
        : fields.price;

      await ctx.db.patch(variant.productId, { basePrice });
    }

    return { id };
  },
});

// ─── Create standalone variant ────────────────────────────────────────────────

export const createVariant = mutation({
  args: {
    productId: v.id("products"),
    adminUserId: v.id("users"),
    size: v.string(),
    color: v.optional(v.string()),
    sku: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    weightGrams: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { productId, adminUserId, ...variantFields }) => {
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Product not found");

    const variantId = await ctx.db.insert("productVariants", {
      productId,
      isActive: variantFields.isActive ?? true,
      ...variantFields,
    });

    await ctx.db.insert("inventory", {
      variantId,
      quantity: 0,
      reservedQuantity: 0,
    });

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "create",
      entityType: "productVariant",
      entityId: variantId,
      description: `Added variant "${variantFields.size}" to product ${productId}`,
    });

    return { id: variantId };
  },
});

// ─── Delete variant ───────────────────────────────────────────────────────────

export const deleteVariant = mutation({
  args: {
    id: v.id("productVariants"),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { id, adminUserId }) => {
    const variant = await ctx.db.get(id);
    if (!variant) throw new Error("Variant not found");

    const productId = variant.productId;

    // Delete associated inventory record
    const inventory = await ctx.db
      .query("inventory")
      .withIndex("by_variant", (q) => q.eq("variantId", id))
      .first();
    if (inventory) {
      await ctx.db.delete(inventory._id);
    }

    // Delete the variant
    await ctx.db.delete(id);

    // Recalculate product basePrice
    const remainingVariants = await ctx.db
      .query("productVariants")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (remainingVariants.length > 0) {
      const basePrice = Math.min(...remainingVariants.map((v) => v.price));
      await ctx.db.patch(productId, { basePrice });
    }

    await ctx.db.insert("auditLogs", {
      userId: adminUserId,
      actionType: "delete",
      entityType: "productVariant",
      entityId: id,
      description: `Deleted variant "${variant.size}" from product ${productId}`,
    });

    return { success: true };
  },
});

// ─── Adjust inventory quantity ────────────────────────────────────────────────

export const adjustInventory = mutation({
  args: {
    variantId: v.id("productVariants"),
    newQuantity: v.number(),
    note: v.optional(v.string()),
    adminUserId: v.id("users"),
  },
  handler: async (ctx, { variantId, newQuantity, note, adminUserId }) => {
    if (newQuantity < 0) throw new Error("Quantity cannot be negative");

    await adjustStockHelper(
      ctx,
      variantId,
      newQuantity,
      note ?? "Manual adjustment",
      adminUserId,
    );

    return { success: true };
  },
});
