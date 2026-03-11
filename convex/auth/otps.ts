/**
 * Auth — OTP request and verification
 * Mirrors: app/routers/auth.py (request_otp, verify_otp endpoints)
 */
import { mutation } from "../_generated/server";
import { v } from "convex/values";

const OTP_EXPIRE_MS = 10 * 60 * 1000;   // 10 minutes
const OTP_RATE_LIMIT = 3;                // max per 10-minute window
const OTP_RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Request OTP ─────────────────────────────────────────────────────────────

export const requestOtp = mutation({
  args: {
    phone: v.string(),
    purpose: v.string(), // 'login' | 'registration' | 'reset'
  },
  handler: async (ctx, { phone, purpose }) => {
    const normalizedPhone = normalizePhone(phone);

    // Rate limiting: count OTP records for this phone in the last 10 minutes
    const windowStart = Date.now() - OTP_RATE_WINDOW_MS;
    const recentOtps = await ctx.db
      .query("otps")
      .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
      .filter((q) => q.gt(q.field("_creationTime"), windowStart))
      .collect();

    if (recentOtps.length >= OTP_RATE_LIMIT) {
      throw new Error("Too many OTP requests. Please wait before requesting again.");
    }

    const otpCode = generateOtpCode();
    const expiresAt = Date.now() + OTP_EXPIRE_MS;

    await ctx.db.insert("otps", {
      phone: normalizedPhone,
      otpCode,
      purpose,
      isUsed: false,
      failedAttempts: 0,
      expiresAt,
    });

    // TODO: Send OTP via SMS service
    // Return code only in development — remove in production
    return {
      message: "OTP sent successfully",
      // Debug only — strip before production:
      _debug_otpCode: otpCode,
    };
  },
});

// ─── Verify OTP — returns { userId, role } for JWT signing in Next.js ────────

export const verifyOtp = mutation({
  args: {
    phone: v.string(),
    otpCode: v.string(),
  },
  handler: async (ctx, { phone, otpCode }) => {
    const normalizedPhone = normalizePhone(phone);
    const now = Date.now();

    // Get latest unexpired unused OTP for this phone
    const otp = await ctx.db
      .query("otps")
      .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
      .filter((q) =>
        q.and(
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), now),
        ),
      )
      .order("desc")
      .first();

    if (!otp) {
      throw new Error("Invalid or expired OTP");
    }

    if (otp.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      throw new Error("Too many failed attempts. Please request a new OTP.");
    }

    // Verify code
    if (otp.otpCode !== otpCode) {
      await ctx.db.patch(otp._id, {
        failedAttempts: otp.failedAttempts + 1,
      });
      throw new Error("Invalid or expired OTP");
    }

    // Mark OTP as used
    await ctx.db.patch(otp._id, {
      isUsed: true,
      usedAt: now,
    });

    // Find or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", normalizedPhone))
      .first();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        phone: normalizedPhone,
        role: "buyer",
        isActive: true,
        isVerified: true,
        lastLoginAt: now,
      });
      user = await ctx.db.get(userId);
    } else {
      await ctx.db.patch(user._id, {
        isVerified: true,
        lastLoginAt: now,
      });
      user = await ctx.db.get(user._id);
    }

    if (!user) throw new Error("Failed to retrieve user");

    return {
      userId: user._id,
      role: user.role,
    };
  },
});
