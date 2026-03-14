import { PathaoWebhookHandler } from "pathao-courier/webhooks";
import { getRequiredPathaoEnv } from "./helpers";
import type {
  HandlePathaoWebhookInput,
  NormalizedPathaoWebhook,
  PathaoIncomingWebhook,
  PathaoWebhookResult,
} from "./types";

const webhookHandler = new PathaoWebhookHandler({
  webhookSecret: getRequiredPathaoEnv("PATHAO_WEBHOOK_SECRET"),
});

export async function handlePathaoWebhook(
  input: HandlePathaoWebhookInput,
): Promise<PathaoWebhookResult> {
  const payload = (input.body && typeof input.body === "object")
    ? (input.body as PathaoIncomingWebhook)
    : {};

  const eventType = [payload.event, payload.type, payload.order_status_slug, payload.order_status]
    .find((v) => typeof v === "string" && v.trim()) ?? "unknown";
  const consignmentId = [payload.consignment_id, payload.consignmentId]
    .find((v) => typeof v === "string" && v.trim()) ?? null;

  console.info(JSON.stringify({
    source: "pathao_webhook",
    timestamp: new Date().toISOString(),
    eventType,
    consignmentId,
  }));

  return webhookHandler.handle(input.body, input.signature ?? null);
}

function readString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function normalizePathaoWebhook(body: unknown): NormalizedPathaoWebhook {
  const payload = (body && typeof body === "object") ? (body as Record<string, unknown>) : {};
  const consignmentId = readString(payload, [
    "consignment_id",
    "consignmentId",
  ]);

  const rawStatus = readString(payload, [
    "order_status_slug",
    "order_status",
    "orderStatus",
    "event",
    "type",
  ]) ?? "unknown";

  return {
    consignmentId,
    pathaoStatus: rawStatus,
  };
}

export { webhookHandler };
