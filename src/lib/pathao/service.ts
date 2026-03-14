import { pathaoClient } from "./client";
import type {
  CreatePathaoStoreInput,
  CreatePathaoStoreResponse,
  CreatePathaoOrderInput,
  CreatePathaoOrderResponse,
  PathaoOrderInfoResponse,
  PathaoAreasResponse,
  PathaoCitiesResponse,
  PathaoConnectionTestResult,
  PathaoPriceRequest,
  PathaoPriceResponse,
  PathaoZonesResponse,
} from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetriableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeError = error as {
    response?: { status?: number };
    message?: string;
    code?: string;
  };

  const status = maybeError.response?.status;
  if (typeof status === "number" && status >= 500) {
    return true;
  }

  const code = (maybeError.code ?? "").toUpperCase();
  if (code === "ECONNRESET" || code === "ECONNABORTED" || code === "ETIMEDOUT" || code === "ENOTFOUND") {
    return true;
  }

  const message = (maybeError.message ?? "").toLowerCase();
  return message.includes("network") || message.includes("timeout") || message.includes("socket");
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    console.error("PATHAO API ERROR");
    console.error("Status Code:", error?.statusCode);
    console.error(
      "Full Response:",
      JSON.stringify(error?.response?.data ?? error?.response ?? error, null, 2),
    );

    if (!isRetriableError(error)) throw error;
    await sleep(500);
    return await fn();
  }
}

export async function getCities(): Promise<PathaoCitiesResponse> {
  return await withRetry(() => pathaoClient.locations.getCities());
}

export async function getZones(cityId: number): Promise<PathaoZonesResponse> {
  return await withRetry(() => pathaoClient.locations.getZones(cityId));
}

export async function getAreas(zoneId: number): Promise<PathaoAreasResponse> {
  return await withRetry(() => pathaoClient.locations.getAreas(zoneId));
}

async function validateZoneCity(cityId: number, zoneId: number): Promise<void> {
  const zones = await getZones(cityId);
  const valid = zones.data?.data?.some((zone) => zone.zone_id === zoneId) ?? false;

  if (!valid) {
    throw new Error("Zone does not belong to selected city");
  }
}

async function validateAreaZone(zoneId: number, areaId: number): Promise<void> {
  const areas = await getAreas(zoneId);
  const valid = areas.data?.data?.some((area) => area.area_id === areaId) ?? false;

  if (!valid) {
    throw new Error("Area does not belong to selected zone");
  }
}

export async function calculatePrice(payload: PathaoPriceRequest): Promise<PathaoPriceResponse> {
  return await withRetry(() => pathaoClient.pricing.calculate(payload));
}

export async function calculateDeliveryPrice(payload: PathaoPriceRequest): Promise<PathaoPriceResponse> {
  return await withRetry(() => pathaoClient.pricing.calculate(payload));
}

export async function createPathaoOrder(payload: CreatePathaoOrderInput): Promise<CreatePathaoOrderResponse> {
  await validateZoneCity(payload.recipient_city, payload.recipient_zone);
  if (typeof payload.recipient_area === "number") {
    await validateAreaZone(payload.recipient_zone, payload.recipient_area);
  }

  const response = await withRetry(() => pathaoClient.orders.create(payload));
  return response as unknown as CreatePathaoOrderResponse;
}

export async function createPathaoStore(payload: CreatePathaoStoreInput): Promise<CreatePathaoStoreResponse> {
  const response = await withRetry(() => pathaoClient.stores.create(payload as never));
  return response as unknown as CreatePathaoStoreResponse;
}

export async function getPathaoOrderInfo(consignmentId: string): Promise<PathaoOrderInfoResponse> {
  const response = await withRetry(() => pathaoClient.orders.getInfo(consignmentId));
  return response as unknown as PathaoOrderInfoResponse;
}

export async function getOrderInfo(consignmentId: string): Promise<PathaoOrderInfoResponse> {
  return await getPathaoOrderInfo(consignmentId);
}

export async function testPathaoConnection(): Promise<PathaoConnectionTestResult> {
  const cities = await withRetry(() => pathaoClient.locations.getCities());
  const cityCount = cities.data?.data?.length ?? 0;

  return {
    ok: true,
    cityCount,
    message: `Pathao connection established. Retrieved ${cityCount} cities.`,
  };
}
