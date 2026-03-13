/**
 * Pathao Authentication — Server-side only.
 * Two-tier token management: module-level memory cache → Pathao API.
 * Never import this in client components.
 */
import type { PathaoTokenResponse } from './types';

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL!;
const TOKEN_BUFFER_MS = 5 * 60 * 1000; // 5-minute safety buffer

// ─── Tier 1: Module-level memory cache ────────────────────────────────────────
let memToken: string | null = null;
let memExpiresAt             = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a valid Pathao Bearer token.
 * Uses the in-memory cache first; issues a new token if the cache is stale.
 */
export async function getAccessToken(): Promise<string> {
  if (memToken && Date.now() + TOKEN_BUFFER_MS < memExpiresAt) {
    return memToken;
  }
  return issueNewToken();
}

/**
 * Bypasses the cache and always issues a fresh token.
 * Call this after receiving a 401 from the Pathao API.
 */
export async function forceNewToken(): Promise<string> {
  memToken = null;
  memExpiresAt = 0;
  return issueNewToken();
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function issueNewToken(): Promise<string> {
  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username:      process.env.PATHAO_USERNAME,
      password:      process.env.PATHAO_PASSWORD,
      grant_type:    'password',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao token request failed: HTTP ${res.status} — ${text}`);
  }

  let data: PathaoTokenResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error('Pathao token response is not valid JSON');
  }

  if (!data.access_token) {
    throw new Error('Pathao token response missing access_token field');
  }

  memToken     = data.access_token;
  memExpiresAt = Date.now() + data.expires_in * 1000;

  return memToken;
}

/**
 * Build a standard Authorization header object.
 */
export function authHeaders(token: string): Record<string, string> {
  return {
    Authorization:  `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept:          'application/json',
  };
}
