/**
 * authConvex.service.ts
 *
 * Drop-in replacement for auth.service.ts that authenticates via Convex
 * instead of the FastAPI backend.
 *
 * JWT signing happens in Next.js Route Handlers (server-side).
 * This module only calls those handlers and persists the returned token.
 *
 * The interface is intentionally identical to authService so callers can be
 * swapped without changes.
 */
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import type { UserDto } from '@/shared/types/api.types';

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  phone?: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
}

// ─── Validation helpers (same as auth.service.ts) ─────────────────────────────

function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }
}

function validatePhone(phone: string): void {
  const n = phone.replace(/[\s\-]/g, '');
  if (!/^01[3-9]\d{8}$/.test(n)) {
    throw new Error('Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX).');
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  const json = await res.json();
  
  if (!res.ok) {
    // Extract error message from various possible formats
    let errorMsg = 
      (json as { error?: string }).error || 
      (json as { message?: string }).message || 
      'Request failed';
    
    // Parse Convex error format: "[Request ID: ...] Server Error\nUncaught Error: ACTUAL_MESSAGE\n    at ..."
    const convexErrorMatch = errorMsg.match(/Uncaught Error: ([^\n]+)/);
    if (convexErrorMatch) {
      errorMsg = convexErrorMatch[1];
    }
    
    throw new Error(errorMsg);
  }
  
  return json as T;
}

// ─── Convex auth service ───────────────────────────────────────────────────────

export const authConvexService = {
  /**
   * Login with phone/email + password.
   * Calls /api/auth/login → Convex → JWT → tokenStore.
   */
  async login(phoneOrEmail: string, password: string): Promise<void> {
    if (!phoneOrEmail.trim()) throw new Error('Phone or email is required.');
    if (!password) throw new Error('Password is required.');

    const { token } = await postJson<{ token: string }>('/api/auth/login', {
      phoneOrEmail: phoneOrEmail.trim(),
      password,
    });
    // Use same JWT as both access and "refresh" since we issue 30-day tokens.
    tokenStore.setTokens(token, token);
  },

  /**
   * Register with phone / email / password.
   * Calls /api/auth/register → Convex → JWT → tokenStore.
   * Returns a minimal UserDto (id is the Convex userId string cast to number).
   */
  async register(payload: RegisterPayload): Promise<UserDto> {
    if (payload.phone?.trim()) {
      validatePhone(payload.phone);
    }
    validateEmail(payload.email);
    if (!payload.username.trim()) throw new Error('Username is required.');
    if (!payload.fullName.trim()) throw new Error('Full name is required.');
    if (!payload.password) throw new Error('Password is required.');

    const { token } = await postJson<{ token: string }>('/api/auth/register', {
      phone: payload.phone?.trim() ? payload.phone.replace(/[\s\-]/g, '') : undefined,
      email: payload.email.trim(),
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      password: payload.password,
    });
    tokenStore.setTokens(token, token);

    // Return a stub UserDto — the app re-fetches full user via userRepository.getMe()
    return {
      id: 0 as unknown as number,
      phone: payload.phone ?? '',
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
      role: 'buyer',
      isActive: true,
      isVerified: false,
      avatarUrl: null,
      googleId: null,
      facebookId: null,
      addressLine: null,
      city: null,
      postalCode: null,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Request an OTP for phone-based login / registration.
   */
  async requestOtp(phone: string, purpose: string = 'login'): Promise<{ message: string }> {
    return postJson('/api/auth/otp', { action: 'request', phone, purpose });
  },

  /**
   * Verify OTP and issue JWT.
   */
  async verifyOtp(phone: string, otpCode: string): Promise<void> {
    const { token } = await postJson<{ token: string }>('/api/auth/otp', {
      action: 'verify',
      phone,
      otpCode,
    });
    tokenStore.setTokens(token, token);
  },

  /** Clear all local credentials. */
  logout(): void {
    tokenStore.clearAll();
  },

  isAuthenticated(): boolean {
    return tokenStore.isAuthenticated();
  },
};
