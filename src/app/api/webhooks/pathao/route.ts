import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { handlePathaoWebhook } from "@/lib/pathao";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const webhookIntegrationSecret = process.env.PATHAO_WEBHOOK_SECRET ?? "";

type OrderStatusForWebhook = "confirmed" | "shipped" | "delivered" | "cancelled";

const PATHAO_EVENT_TO_ORDER_STATUS: Record<string, OrderStatusForWebhook> = {
  order_created: "confirmed",
  created: "confirmed",
  confirmed: "confirmed",
  pending: "confirmed",
  order_assigned: "confirmed",
  assigned: "confirmed",
  order_picked: "shipped",
  picked: "shipped",
  pickup: "shipped",
  in_transit: "shipped",
  transit: "shipped",
  order_delivered: "delivered",
  delivered: "delivered",
  order_returned: "cancelled",
  returned: "cancelled",
  cancelled: "cancelled",
  canceled: "cancelled",
};

function normalizeEventFromBody(body: Record<string, unknown>): string {
  const raw = [body.event, body.type, body.order_status_slug, body.order_status]
    .find((value) => typeof value === "string" && value.trim()) as string | undefined;

  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "_")
    .replace(/\s+/g, "_");
}

function webhookResponse(payload: Record<string, unknown>, status = 202): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Pathao-Merchant-Webhook-Integration-Secret": "f3992ecc-59da-4cbe-a049-a13da2018d51",
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  console.log("[Pathao Webhook] Step 1: request received");

  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    console.warn("[Pathao Webhook] Step 2: invalid JSON payload");
    return webhookResponse({ success: true, skipped: true, reason: "invalid_json" });
  }

  const {
    consignment_id: consignmentRaw,
    merchant_order_id: merchantOrderRaw,
  } = body;
  const consignment_id = typeof consignmentRaw === "string" ? consignmentRaw.trim() : "";
  const merchant_order_id = typeof merchantOrderRaw === "string" ? merchantOrderRaw.trim() : "";
  const event = normalizeEventFromBody(body);
  const mapped = PATHAO_EVENT_TO_ORDER_STATUS[event];
  const collectedAmountRaw = body.collected_amount;
  const collectedAmount =
    typeof collectedAmountRaw === "number"
      ? collectedAmountRaw
      : (typeof collectedAmountRaw === "string" && collectedAmountRaw.trim()
          ? Number(collectedAmountRaw)
          : null);

  console.log("[Pathao Webhook] Step 2: payload normalized", {
    event,
    consignmentId: consignment_id || null,
    merchantOrderId: merchant_order_id || null,
  });

  if (!event || (!consignment_id && !merchant_order_id)) {
    console.warn("[Pathao Webhook] Step 3: missing event or identifier");
    return webhookResponse({ success: true, skipped: true, reason: "missing_event_or_identifier" });
  }

  console.log("[Pathao Webhook] Step 4: signature verification disabled");

  console.log("[Pathao Webhook] Step 5: locating order");
  let order = null;
  if (consignment_id) {
    order = await convex.query((api as any).orders.queries.getOrderByConsignmentId, {
      consignmentId: consignment_id,
    });
  }

  if (!order && merchant_order_id) {
    order = await convex.query((api as any).orders.queries.getOrderByOrderNumber, {
      orderNumber: merchant_order_id,
    });
  }

  if (!order) {
    console.warn("[Pathao Webhook] Step 5: order not found");
    return webhookResponse({ success: true, skipped: true, reason: "order_not_found" });
  }

  const targetConsignmentId = consignment_id || order.pathaoConsignmentId;
  if (!targetConsignmentId) {
    console.warn("[Pathao Webhook] Step 6: consignment missing on order");
    return webhookResponse({ success: true, skipped: true, reason: "consignment_missing" });
  }

  try {
    console.log("[Pathao Webhook] Step 7: updating order status", {
      consignmentId: targetConsignmentId,
      event,
      mappedStatus: mapped ?? null,
    });
    await convex.mutation((api as any).orders.mutations.updatePathaoStatus, {
      consignmentId: targetConsignmentId,
      pathaoStatus: event,
      ...(mapped ? { status: mapped } : {}),
      rawPayload: {
        body,
        collectedAmount,
      },
    });
  } catch (error) {
    return webhookResponse(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to process webhook",
      },
      500,
    );
  }

  console.log("[Pathao Webhook] Step 8: processed successfully", {
    consignmentId: targetConsignmentId,
    event,
  });

  return webhookResponse({ success: true, event, consignmentId: targetConsignmentId });
}
