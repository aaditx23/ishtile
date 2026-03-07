import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { tokenStore } from './tokenStore';
import type {
  PasswordLoginResponse,
  RegisterResponse,
  UserDto,
} from '@/shared/types/api.types';

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }
}

function validatePhone(phone: string): void {
  const normalised = phone.replace(/[\s\-]/g, '');
  if (!/^01[3-9]\d{8}$/.test(normalised)) {
    throw new Error('Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX).');
  }
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  phone: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with phone or email and password — saves tokens on success.
   */
  async login(phoneOrEmail: string, password: string): Promise<void> {
    if (!phoneOrEmail.trim()) throw new Error('Phone or email is required.');
    if (!password) throw new Error('Password is required.');

    const res = await apiClient.post<PasswordLoginResponse>(ENDPOINTS.auth.login, {
      phone_or_email: phoneOrEmail.trim(),
      password,
    });
    tokenStore.setTokens(res.token, res.data.refreshToken);
  },

  /**
   * Register a new account with email/password — saves tokens on success.
   */
  async register(payload: RegisterPayload): Promise<UserDto> {
    validatePhone(payload.phone);
    validateEmail(payload.email);

    if (!payload.username.trim()) throw new Error('Username is required.');
    if (!payload.fullName.trim()) throw new Error('Full name is required.');
    if (!payload.password) throw new Error('Password is required.');

    const res = await apiClient.post<RegisterResponse>(ENDPOINTS.auth.register, {
      phone: payload.phone.replace(/[\s\-]/g, ''),
      email: payload.email.trim(),
      username: payload.username.trim(),
      full_name: payload.fullName.trim(),
      password: payload.password,
    });
    tokenStore.setTokens(res.token, res.data.refreshToken);
    return res.data.user;
  },

  /** Clear all local credentials (client-side logout). */
  logout(): void {
    tokenStore.clearAll();
  },

  isAuthenticated(): boolean {
    return tokenStore.isAuthenticated();
  },
};
