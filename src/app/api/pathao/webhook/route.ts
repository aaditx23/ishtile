/**
 * POST /api/pathao/webhook
 * Public endpoint — receives delivery status events from Pathao.
 *
 * Security: HMAC-SHA256 signature verified via X-PATHAO-Signature header.
 * Idempotency: handled by processWebhook Convex mutation.
 * Always responds 202 to satisfy Pathao's retry expectations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { verifySignature, mapPathaoStatus } from '@/integrations/pathao/webhook';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const WEBHOOK_SECRET = process.env.PATHAO_WEBHOOK_SECRET ?? '';

// Pathao integration verification event
const EVENT_VERIFICATION = 'webhook_integration';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Read raw body for HMAC verification
  const rawAb = await req.arrayBuffer();
  const rawBody = Buffer.from(rawAb);

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  // 2. Handle integration verification handshake
  if (payload.event === EVENT_VERIFICATION) {
    const challengeHeader = req.headers.get('x-pathao-webhook-challenge') ?? '';
    return new NextResponse(challengeHeader, {
      status:  202,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // 3. Verify HMAC-SHA256 signature (skip only if secret not configured — dev mode)
  if (WEBHOOK_SECRET) {
    const signature = req.headers.get('x-pathao-signature') ?? '';
    if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      // Log and ignore; always 202 to avoid Pathao retry storms
      console.warn('[pathao-webhook] invalid signature — ignored');
      return NextResponse.json({ received: true }, { status: 202 });
    }
  }

  // 4. Extract consignment ID and status
  const consignmentId = String(payload.consignment_id ?? payload.order_id ?? '');
  const statusSlug    = String(payload.order_status ?? payload.status ?? '');

  if (!consignmentId || !statusSlug) {
    return NextResponse.json({ received: true }, { status: 202 });
  }

  const internalStatus = mapPathaoStatus(statusSlug);
  if (!internalStatus) {
    // Unknown status — acknowledge and ignore
    return NextResponse.json({ received: true }, { status: 202 });
  }

  // 5. Process in Convex (idempotent — uses idempotencyKeys table)
  try {
    await convex.mutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name: 'shipments:processWebhook' } as any,
      {
        consignmentId,
        status:      internalStatus,
        pathaoStatus: statusSlug,
        rawPayload:  JSON.stringify(payload),
      },
    );
  } catch (err) {
    // Log error but still return 202 — Pathao should not retry on internal errors
    console.error('[pathao-webhook] processWebhook error', err);
  }

  return NextResponse.json({ received: true }, { status: 202 });
}
