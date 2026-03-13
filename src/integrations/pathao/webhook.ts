/**
 * Pathao Webhook Utilities — Server-side only.
 * Signature verification and status slug mapping.
 */
import crypto from 'crypto';
import type { ShipmentStatus } from './types';

// ─── Signature Verification ───────────────────────────────────────────────────

/**
 * Verifies the HMAC-SHA256 signature sent by Pathao on webhook events.
 * @param rawBody   The raw request body as a Buffer.
 * @param signature The value of the X-PATHAO-Signature header.
 * @param secret    PATHAO_WEBHOOK_SECRET environment variable.
 */
export function verifySignature(
  rawBody: Buffer,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  // Use timingSafeEqual to prevent timing-attack leakage
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(signature, 'utf8'),
    );
  } catch {
    return false;
  }
}

// ─── Status Mapping ───────────────────────────────────────────────────────────

/**
 * Maps a Pathao order_status slug string to an internal ShipmentStatus.
 * Pathao status strings are in Bangla mixed with English;
 * substring matching covers all known variants.
 *
 * Returns null if the slug is unrecognised (caller should ignore).
 */
export function mapPathaoStatus(slug: string): ShipmentStatus | null {
  const lower = slug.toLowerCase();

  if (lower.includes('pending') || lower.includes('assigned'))  return 'created';
  if (lower.includes('pickup') || lower.includes('picked'))     return 'picked_up';
  if (lower.includes('transit') || lower.includes('on the way')) return 'in_transit';
  if (lower.includes('delivered'))                               return 'delivered';
  if (lower.includes('return'))                                  return 'returned';
  if (lower.includes('fail') || lower.includes('cancel'))       return 'cancelled';

  return null;
}
