import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { tokenStore } from './tokenStore';
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  PasswordLoginResponse,
  RegisterResponse,
  UserDto,
} from '@/shared/types/api.types';

// ─── Validation helpers ───────────────────────────────────────────────────────

/** BD mobile: 01[3-9]XXXXXXXX (11 digits). Strips spaces/dashes first. */
function validatePhone(phone: string): void {
  const normalised = phone.replace(/[\s\-]/g, '');
  if (!/^01[3-9]\d{8}$/.test(normalised)) {
    throw new Error('Enter a valid Bangladeshi mobile number (e.g. 01XXXXXXXXX).');
  }
}

function validateOtp(otp: string): void {
  if (!/^\d{4,8}$/.test(otp.trim())) {
    throw new Error('OTP must be 4–8 digits.');
  }
}

function validateEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.');
  }
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface RegisterPayload {
  phone: string;
  otpCode: string;
  username?: string;
  fullName?: string;
  email?: string;
  password?: string;
}

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Request a one-time password to be sent to the given phone number.
   * `purpose` is either "login" or "register".
   */
  async requestOtp(phone: string, purpose: 'login' | 'register'): Promise<void> {
    validatePhone(phone);
    await apiClient.post<RequestOtpResponse>(ENDPOINTS.auth.requestOtp, {
      phone: phone.replace(/[\s\-]/g, ''),
      purpose,
    });
  },

  /**
   * Verify OTP — on success the access + refresh tokens are saved automatically.
   */
  async verifyOtp(phone: string, otpCode: string): Promise<void> {
    validatePhone(phone);
    validateOtp(otpCode);
    const res = await apiClient.post<VerifyOtpResponse>(ENDPOINTS.auth.verifyOtp, {
      phone: phone.replace(/[\s\-]/g, ''),
      otpCode: otpCode.trim(),
    });
    tokenStore.setTokens(res.token, res.data.refreshToken);
  },

  /**
   * Password login — saves tokens on success.
   */
  async login(phoneOrEmail: string, password: string): Promise<void> {
    if (!phoneOrEmail.trim()) throw new Error('Phone or email is required.');
    if (!password) throw new Error('Password is required.');
    const res = await apiClient.post<PasswordLoginResponse>(ENDPOINTS.auth.login, {
      phoneOrEmail: phoneOrEmail.trim(),
      password,
    });
    tokenStore.setTokens(res.token, res.data.refreshToken);
  },

  /**
   * Register a new buyer account — saves tokens on success and returns the
   * created user.
   */
  async register(payload: RegisterPayload): Promise<UserDto> {
    validatePhone(payload.phone);
    validateOtp(payload.otpCode);
    if (payload.email) validateEmail(payload.email);

    const res = await apiClient.post<RegisterResponse>(ENDPOINTS.auth.register, {
      ...payload,
      phone: payload.phone.replace(/[\s\-]/g, ''),
      otpCode: payload.otpCode.trim(),
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
