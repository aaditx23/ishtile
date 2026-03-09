/**
 * Helper to extract the current user's Convex userId from the stored access token.
 * Decodes the JWT payload client-side (no signature verification needed here —
 * the server verifies the token on every Route Handler call; this is only used
 * to supply the userId argument to Convex mutations from client code).
 */
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { decodeTokenPayload } from '@/lib/auth';

export function getConvexUserId(): string | null {
  const token = tokenStore.getAccess();
  if (!token) return null;
  return decodeTokenPayload(token)?.userId ?? null;
}

export function requireConvexUserId(): string {
  const id = getConvexUserId();
  if (!id) throw new Error('Not authenticated');
  return id;
}

export function getConvexUserRole(): 'buyer' | 'admin' | null {
  const token = tokenStore.getAccess();
  if (!token) return null;
  return decodeTokenPayload(token)?.role ?? null;
}
