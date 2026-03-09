/**
 * JWT utilities — server-only.
 *
 * signToken   — called in Next.js Route Handlers after a successful
 *               Convex auth mutation to issue a JWT to the client.
 * verifyToken — called in Route Handlers / middleware to validate
 *               incoming requests.
 * decodeTokenPayload — client-safe decode (no signature check),
 *               used to extract userId from the stored access token.
 */
import { SignJWT, jwtVerify } from 'jose';

export interface AuthTokenPayload {
  userId: string; // Convex Id<"users">
  role: 'buyer' | 'admin';
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET env variable is not set');
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ userId: payload.userId, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      role: payload.role as 'buyer' | 'admin',
    };
  } catch {
    return null;
  }
}

/**
 * Decode JWT payload WITHOUT verifying the signature.
 * Safe to call in client components — the secret is never exposed.
 * Use this to extract userId/role from the stored access token.
 */
export function decodeTokenPayload(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    if (!payload.userId || !payload.role) return null;
    return { userId: payload.userId as string, role: payload.role as 'buyer' | 'admin' };
  } catch {
    return null;
  }
}
