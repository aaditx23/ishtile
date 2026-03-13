/**
 * Pathao Parcel Operations — Server-side only.
 * Creates parcels and queries their status from the Pathao Courier API.
 */
import { getAccessToken, forceNewToken, authHeaders } from './auth';
import type {
  PathaoCreateParcelPayload,
  PathaoParcelData,
  PathaoOrderStatusData,
  PathaoPricePlanPayload,
  PathaoPricePlanResult,
  PathaoCity,
  PathaoZone,
  PathaoArea,
} from './types';

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL!;
const IS_SANDBOX      = PATHAO_BASE_URL.toLowerCase().includes('sandbox');

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a parcel booking with Pathao.
 * Retries once on 401 with a fresh token; never retries on 5xx.
 */
export async function createParcel(
  payload: PathaoCreateParcelPayload,
): Promise<PathaoParcelData> {
  const effectivePayload: PathaoCreateParcelPayload = IS_SANDBOX
    ? { ...payload, store_id: 1 }
    : payload;

  const token = await getAccessToken();
  const res = await callCreateParcel(token, effectivePayload);

  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await callCreateParcel(freshToken, effectivePayload);
    return parseParcelResponse(retry);
  }

  return parseParcelResponse(res);
}

/**
 * Preview the delivery fee for a parcel before creating it.
 * Uses POST /aladdin/api/v1/merchant/price-plan.
 * Retries once on 401 with a fresh token.
 */
export async function getPricePlan(
  payload: PathaoPricePlanPayload,
): Promise<PathaoPricePlanResult> {
  const effectivePayload: PathaoPricePlanPayload = IS_SANDBOX
    ? { ...payload, store_id: 1 }
    : payload;

  const token = await getAccessToken();
  const res = await callPricePlan(token, effectivePayload);

  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await callPricePlan(freshToken, effectivePayload);
    return parsePricePlanResponse(retry);
  }

  return parsePricePlanResponse(res);
}

/**
 * Fetches all available Pathao cities.
 */
export async function getCityList(): Promise<PathaoCity[]> {
  const token = await getAccessToken();
  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/city-list`, {
    headers: authHeaders(token),
  });
  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/city-list`, {
      headers: authHeaders(freshToken),
    });
    return parseCityListResponse(retry);
  }
  return parseCityListResponse(res);
}

/**
 * Fetches all zones for a given Pathao city ID.
 */
export async function getZoneList(cityId: number): Promise<PathaoZone[]> {
  const token = await getAccessToken();
  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
    headers: authHeaders(token),
  });
  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
      headers: authHeaders(freshToken),
    });
    return parseZoneListResponse(retry);
  }
  return parseZoneListResponse(res);
}

/**
 * Fetches all areas for a given Pathao zone ID.
 */
export async function getAreaList(zoneId: number): Promise<PathaoArea[]> {
  const token = await getAccessToken();
  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/zones/${zoneId}/area-list`, {
    headers: authHeaders(token),
  });
  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/zones/${zoneId}/area-list`, {
      headers: authHeaders(freshToken),
    });
    return parseAreaListResponse(retry);
  }
  return parseAreaListResponse(res);
}

/**
 * Fetches current status of a parcel by consignment ID.
 * Retries once on 401 with a fresh token.
 */
export async function getParcelStatus(
  consignmentId: string,
): Promise<PathaoOrderStatusData> {
  const token = await getAccessToken();
  const res = await callGetStatus(token, consignmentId);

  if (res.status === 401) {
    const freshToken = await forceNewToken();
    const retry = await callGetStatus(freshToken, consignmentId);
    return parseStatusResponse(retry);
  }

  return parseStatusResponse(res);
}

// ─── Private helpers ──────────────────────────────────────────────────────────

async function callCreateParcel(
  token: string,
  payload: PathaoCreateParcelPayload,
): Promise<Response> {
  return fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/orders`, {
    method:  'POST',
    headers: authHeaders(token),
    body:    JSON.stringify(payload),
  });
}

async function callGetStatus(
  token: string,
  consignmentId: string,
): Promise<Response> {
  return fetch(
    `${PATHAO_BASE_URL}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}`,
    { headers: authHeaders(token) },
  );
}

async function parseParcelResponse(res: Response): Promise<PathaoParcelData> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao createParcel failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  const parcel: PathaoParcelData | undefined = json?.data?.order;
  if (!parcel?.consignment_id) {
    throw new Error(`Pathao createParcel: unexpected response shape — ${JSON.stringify(json)}`);
  }
  return parcel;
}

async function parseStatusResponse(res: Response): Promise<PathaoOrderStatusData> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao getParcelStatus failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  const order: PathaoOrderStatusData | undefined = json?.data;
  if (!order) {
    throw new Error(`Pathao getParcelStatus: unexpected response shape — ${JSON.stringify(json)}`);
  }
  return order;
}

async function callPricePlan(
  token: string,
  payload: PathaoPricePlanPayload,
): Promise<Response> {
  return fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/merchant/price-plan`, {
    method:  'POST',
    headers: authHeaders(token),
    body:    JSON.stringify(payload),
  });
}

async function parsePricePlanResponse(res: Response): Promise<PathaoPricePlanResult> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao price-plan failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  const plan: PathaoPricePlanResult | undefined = json?.data;
  if (plan?.final_price === undefined) {
    throw new Error(`Pathao price-plan: unexpected response shape — ${JSON.stringify(json)}`);
  }
  return plan;
}

async function parseCityListResponse(res: Response): Promise<PathaoCity[]> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao city-list failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  return (json?.data?.data ?? json?.data ?? []) as PathaoCity[];
}

async function parseZoneListResponse(res: Response): Promise<PathaoZone[]> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao zone-list failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  return (json?.data?.data ?? json?.data ?? []) as PathaoZone[];
}

async function parseAreaListResponse(res: Response): Promise<PathaoArea[]> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Pathao area-list failed: HTTP ${res.status} — ${text}`);
  }
  const json = await res.json();
  return (json?.data?.data ?? json?.data ?? []) as PathaoArea[];
}
