import type { PathaoWebhookHandlerConfig } from "pathao-courier/webhooks";

export interface PathaoCity {
  city_id: number;
  city_name: string;
}

export interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

export interface PathaoArea {
  area_id: number;
  area_name: string;
  home_delivery_available: boolean;
  pickup_available: boolean;
}

export interface PathaoCitiesResponse {
  message: string;
  type: string;
  code: number;
  data: { data: PathaoCity[] };
}

export interface PathaoZonesResponse {
  message: string;
  type: string;
  code: number;
  data: { data: PathaoZone[] };
}

export interface PathaoAreasResponse {
  message: string;
  type: string;
  code: number;
  data: { data: PathaoArea[] };
}

export interface PathaoPriceRequest {
  store_id: number;
  item_type: number;
  delivery_type: number;
  item_weight: number;
  recipient_city: number;
  recipient_zone: number;
}

export interface PathaoPriceResponse {
  message: string;
  type: string;
  code: number;
  data: {
    price: number;
    discount: number;
    promo_discount: number;
    plan_id: number;
    cod_enabled: number;
    cod_percentage: number;
    additional_charge: number;
    final_price: number;
  };
}

export interface CreatePathaoStoreInput {
  name: string;
  contact_name: string;
  contact_number: string;
  address: string;
  city_id: number;
  zone_id: number;
  area_id: number;
}

export interface CreatePathaoStoreResponse {
  message?: string;
  type?: string;
  code?: number;
  data?: {
    store?: {
      store_id?: number;
      id?: number;
      name?: string;
      city_id?: number;
      zone_id?: number;
      area_id?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface PathaoListedStore {
  store_id?: number;
  id?: number;
  store_name?: string;
  name?: string;
  store_address?: string;
  address?: string;
  is_active?: number;
  city_id?: number;
  zone_id?: number;
  hub_id?: number;
  [key: string]: unknown;
}

export interface PathaoStoreListResponse {
  message?: string;
  type?: string;
  code?: number;
  data?: {
    data?: PathaoListedStore[];
    stores?: PathaoListedStore[];
    total?: number;
    [key: string]: unknown;
  };
}

export interface CreatePathaoOrderInput {
  store_id: number;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number;
  recipient_zone: number;
  recipient_area?: number;
  delivery_type: number;
  item_type: number;
  item_weight: number;
  item_quantity: number;
  amount_to_collect: number;
  special_instruction?: string;
  callback_url?: string;
}

export interface CreatePathaoOrderResponse {
  message?: string;
  type?: string;
  code?: number;
  data?: {
    order?: {
      consignment_id?: string;
      order_status?: string;
      delivery_fee?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface PathaoOrderInfoResponse {
  message?: string;
  type?: string;
  code?: number;
  data?: {
    order?: {
      consignment_id?: string;
      order_status?: string;
      order_status_slug?: string;
      delivery_fee?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export type PathaoWebhookConfig = PathaoWebhookHandlerConfig;
export interface PathaoWebhookPayload {
  event?: string;
  type?: string;
  consignment_id?: string;
  consignmentId?: string;
  order_status?: string;
  order_status_slug?: string;
  orderStatus?: string;
  [key: string]: unknown;
}

export type PathaoIncomingWebhook = PathaoWebhookPayload;
export type PathaoWebhookResult =
  | { status: "success" }
  | { status: "error"; message: string };

export interface NormalizedPathaoWebhook {
  consignmentId: string | null;
  pathaoStatus: string;
}

export interface PathaoConnectionTestResult {
  ok: boolean;
  cityCount: number;
  message: string;
}

export interface HandlePathaoWebhookInput {
  body: unknown;
  signature?: string | null;
}
