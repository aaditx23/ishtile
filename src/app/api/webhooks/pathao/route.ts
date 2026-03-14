import { NextRequest } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { handlePathaoWebhook } from "@/lib/pathao";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const webhookIntegrationSecret = process.env.PATHAO_WEBHOOK_SECRET ?? "";


// Consistent Pathao → Order status mapping
const PATHAO_STATUS_MAP = {
  Pending: "confirmed",
  assigned: "assigned",
  picked: "shipped",
  in_transit: "shipped",
  delivered: "delivered",
  returned: "cancelled",
  order_assigned: "assigned",
  order_picked: "shipped",
  order_delivered: "delivered",
  order_returned: "cancelled",
};

function successWebhookResponse(): Response {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Pathao-Merchant-Webhook-Integration-Secret": webhookIntegrationSecret,
    },
  });
}

export async function POST(req: NextRequest): Promise<Response> {
  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    return successWebhookResponse();
  }

  const {
    consignment_id: consignmentRaw,
    merchant_order_id: merchantOrderRaw,
    event: eventRaw,
  } = body;
  const consignment_id = typeof consignmentRaw === "string" ? consignmentRaw.trim() : "";
  const merchant_order_id = typeof merchantOrderRaw === "string" ? merchantOrderRaw.trim() : "";
  const event = typeof eventRaw === "string" ? eventRaw.trim().toLowerCase().replace(/\./g, "_") : "";
  const mapped = PATHAO_STATUS_MAP[event as keyof typeof PATHAO_STATUS_MAP];
  const collectedAmountRaw = body.collected_amount;
  const collectedAmount =
    typeof collectedAmountRaw === "number"
      ? collectedAmountRaw
      : (typeof collectedAmountRaw === "string" && collectedAmountRaw.trim()
          ? Number(collectedAmountRaw)
          : null);

  if (event && (consignment_id || merchant_order_id)) {
    const signature = req.headers.get("x-pathao-signature");
    void (async () => {
      if (signature) {
        try {
          const verification = await handlePathaoWebhook({ body, signature });
          if (verification.status !== "success") return;
        } catch {
          return;
        }
      }

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

      if (!order) return;

      const targetConsignmentId = consignment_id || order.pathaoConsignmentId;
      if (!targetConsignmentId) return;

      console.log('Pathao courier status:', event);
      console.log('Updating order:', order._id);
      await convex.mutation((api as any).orders.mutations.updatePathaoStatus, {
        consignmentId: targetConsignmentId,
        pathaoStatus: event,
        ...(mapped ? { status: mapped } : {}),
        rawPayload: {
          body,
          collectedAmount,
        },
      });
    })();
  }

  return successWebhookResponse();
}
