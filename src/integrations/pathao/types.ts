/**
 * Pathao API — TypeScript type definitions
 * Server-side only — never import in client components.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface PathaoTokenResponse {
  access_token:  string;
  token_type:    string;
  expires_in:    number;   // seconds
  refresh_token?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface PathaoStorePayload {
  name:           string;
  contact_name:   string;
  contact_number: string;
  address:        string;
  city_id:        number;
  zone_id:        number;
  area_id:        number;
}

export interface PathaoStoreData {
  store_id:       number;
  name:           string;
  contact_number: string;
  address:        string;
  city_id:        number;
  zone_id:        number;
  area_id:        number;
}

// ─── Create Parcel ────────────────────────────────────────────────────────────

export interface PathaoCreateParcelPayload {
  store_id:          number;
  merchant_order_id: string;
  recipient_name:    string;
  recipient_phone:   string;
  recipient_address: string;
  recipient_city:    number;   // Pathao city_id
  recipient_zone:    number;   // Pathao zone_id
  recipient_area:    number;   // Pathao area_id
  delivery_type:     number;   // 48 = Normal, 12 = Express
  item_type:         number;   // 2 = Fashion/Clothing
  item_quantity:     number;
  item_weight:       number;   // grams
  amount_to_collect: number;   // BDT (COD amount)
  item_description?: string;
}

export interface PathaoParcelData {
  consignment_id:    string;
  merchant_order_id: string;
  order_status:      string;
  delivery_fee:      number;
}

// ─── Price Plan ───────────────────────────────────────────────────────────────────

export interface PathaoPricePlanPayload {
  store_id:       number;
  item_type:      number;  // 2 = parcel
  delivery_type:  number;  // 48 = Normal, 12 = Same Day
  item_weight:    number;  // kg
  recipient_city: number;
  recipient_zone: number;
   recipient_area: number;
}

export interface PathaoPricePlanResult {
  price_plan_id:  number;
  price_plan_name: string;
  final_price:    number;
}

// ─── Order Status ─────────────────────────────────────────────────────────────

export interface PathaoOrderStatusData {
  consignment_id:     string;
  merchant_order_id:  string;
  order_status:       string;
  order_status_slug:  string;
  delivery_fee:       number;
  status_update_time?: string;
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface PathaoCity  { id: number; name: string; }
export interface PathaoZone  { id: number; name: string; city_id: number; }
export interface PathaoArea  { id: number; name: string; zone_id: number; }

// ─── Shipment Status (internal) ───────────────────────────────────────────────

export type ShipmentStatus =
  | 'pending'
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'returned'
  | 'cancelled';

// ─── Create Parcel Args (app layer) ──────────────────────────────────────────

export interface CreateParcelArgs {
  merchantOrderId:  string;
  recipientName:    string;
  recipientPhone:   string;
  recipientAddress: string;
  recipientCityId:  number;
  recipientZoneId:  number;
  recipientAreaId:  number;
  itemValue:        number;
  itemQuantity:     number;
  itemWeight:       number;
  deliveryType?:    number;
  itemDescription?: string;
}
