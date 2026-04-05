/**
 * CSV Utilities - Convert orders to Pathao-compatible CSV format
 */

/**
 * Order-like type for CSV conversion (accepts both domain Order and Convex order)
 */
type OrderLike = {
  id: string | number;
  orderNumber?: string;
  shippingName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  shippingZoneName?: string | null;
  shippingAreaName?: string | null;
  total: number;
  customerNotes?: string | null;
  items?: Array<{ quantity: number }>;
};

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert orders to Pathao CSV format
 * Format: ItemType,StoreName,MerchantOrderId,RecipientName,RecipientPhone,
 *         RecipientCity,RecipientZone,RecipientArea,RecipientAddress,
 *         AmountToCollect,ItemQuantity,ItemWeight,ItemDesc,SpecialInstruction
 */
export function ordersToCsvString(orders: OrderLike[]): string {
  const headers = [
    'ItemType',
    'StoreName',
    'MerchantOrderId',
    'RecipientName',
    'RecipientPhone',
    'RecipientCity',
    'RecipientZone',
    'RecipientArea',
    'RecipientAddress',
    'AmountToCollect',
    'ItemQuantity',
    'ItemWeight',
    'ItemDesc',
    'SpecialInstruction',
  ];

  const rows = orders.map((order) => {
    // Calculate total quantity from items
    const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;

    // Format address with city appended
    const addressParts = [order.shippingAddress, order.shippingCity].filter(Boolean);
    const formattedAddress = addressParts.join(',');

    // Use zone/area names if available, otherwise fall back to city
    const zone = order.shippingZoneName || order.shippingCity;
    const area = order.shippingAreaName || order.shippingCity;

    return [
      'parcel', // ItemType
      'fashionkingbd.com', // StoreName
      order.orderNumber || String(order.id), // MerchantOrderId
      order.shippingName, // RecipientName
      order.shippingPhone, // RecipientPhone
      order.shippingCity, // RecipientCity
      zone, // RecipientZone
      area, // RecipientArea
      formattedAddress, // RecipientAddress
      order.total.toString(), // AmountToCollect
      totalQuantity.toString(), // ItemQuantity
      '500', // ItemWeight (static 500 grams)
      '', // ItemDesc (empty)
      order.customerNotes || '', // SpecialInstruction
    ];
  });

  // Combine headers and rows
  const csvLines = [headers, ...rows].map((row) =>
    row.map(escapeCsvValue).join(',')
  );

  return csvLines.join('\n');
}
