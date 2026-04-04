/**
 * CSV Utilities - Convert orders to Pathao-compatible CSV format
 */

import type { Order } from '@/domain/order/order.entity';

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
export function ordersToCsvString(orders: Order[]): string {
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

    // Format address with city appended (zone/area from address line or empty)
    const addressParts = [order.shippingAddress, order.shippingCity].filter(Boolean);
    const formattedAddress = addressParts.join(',');

    // Extract zone/area from address or use city as fallback
    const zone = order.shippingCity; // Use city as zone
    const area = order.shippingCity; // Use city as area

    return [
      'parcel', // ItemType
      'fashionkingbd.com', // StoreName
      order.orderNumber || order.id.toString(), // MerchantOrderId
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
