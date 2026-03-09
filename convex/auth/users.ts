/**
 * Auth — user registration and password login
 * Mirrors: app/routers/auth.py (login, register endpoints)
 * 
 * NOTE: JWT signing happens in lib/auth.ts (Next.js), not here.
 * These mutations return { userId, role } — Next.js signs the tokens.
 * 
 * NOTE: bcryptjs synchronous functions work in Convex V8 isolate.
 * Password HASHING happens in Next.js (authConvex.service.ts) before calling register.
 * Password COMPARING (bcrypt.compareSync) happens here — synchronous, no setTimeout.
 */
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// ─── Password login ───────────────────────────────────────────────────────────

export const loginWithPassword = mutation({
  args: {
    phoneOrEmail: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { phoneOrEmail, password }) => {
    const identifier = phoneOrEmail.trim();

    // Try phone, email, username
    let user =
      (await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", identifier))
        .first()) ??
      (await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", identifier))
        .first()) ??
      (await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", identifier))
        .first());

    if (!user || !user.passwordHash) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    // bcryptjs.compareSync is synchronous — works in Convex V8 isolate
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bcrypt = require("bcryptjs") as typeof import("bcryptjs");
    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    await ctx.db.patch(user._id, { lastLoginAt: Date.now() });

    return { userId: user._id, role: user.role };
  },
});

// ─── Register ────────────────────────────────────────────────────────────────
// passwordHash must be pre-computed in Next.js (bcrypt.hash cannot use randomness
// in the V8 isolate). Pass the hash here.

export const register = mutation({
  args: {
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    fullName: v.optional(v.string()),
    passwordHash: v.string(),
  },
  handler: async (ctx, { phone, email, username, fullName, passwordHash }) => {
    if (!phone && !email && !username) {
      throw new Error("At least one of username, email, or phone is required");
    }

    // Uniqueness checks
    if (phone) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", phone))
        .first();
      if (existing) throw new Error("An account with this phone number already exists");
    }

    if (email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existing) throw new Error("An account with this email already exists");
    }

    if (username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      if (existing) throw new Error("Username already taken");
    }

    const userId = await ctx.db.insert("users", {
      phone,
      email,
      username,
      fullName,
      passwordHash,
      role: "buyer",
      isActive: true,
      isVerified: false,
    });

    return { userId };
  },
});

// ─── Get current user ─────────────────────────────────────────────────────────

export const getMe = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    // Never expose passwordHash
    const { passwordHash: _pw, ...safeUser } = user;
    return { ...safeUser, id: user._id };
  },
});

// ─── Update profile ────────────────────────────────────────────────────────────

export const updateMe = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    addressLine: v.optional(v.string()),
    city: v.optional(v.string()),
    postalCode: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...fields }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check email uniqueness if changing
    if (fields.email && fields.email !== user.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", fields.email!))
        .first();
      if (existing) throw new Error("An account with this email already exists");
    }

    // Check username uniqueness if changing
    if (fields.username && fields.username !== user.username) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", fields.username!))
        .first();
      if (existing) throw new Error("Username already taken");
    }

    // Remove undefined fields
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    );

    await ctx.db.patch(userId, patch);

    const updated = await ctx.db.get(userId);
    if (!updated) return null;
    const { passwordHash: _pw, ...safeUser } = updated;
    return { ...safeUser, id: updated._id };
  },
});

// ─── Create Admin (seed only) ─────────────────────────────────────────────────

export const createAdmin = mutation({
  args: {
    phone: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, { phone, email, passwordHash, fullName }) => {
    // Check if admin already exists
    const existingByEmail = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingByEmail) {
      throw new Error("An account with this email already exists");
    }

    const existingByPhone = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();

    if (existingByPhone) {
      throw new Error("An account with this phone already exists");
    }

    const userId = await ctx.db.insert("users", {
      phone,
      email,
      fullName: fullName || "Admin",
      passwordHash,
      role: "admin",
      isActive: true,
      isVerified: true,
    });

    return { userId, role: "admin" };
  },
});
