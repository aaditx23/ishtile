import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { getBaseUrl } from '@/shared/config/baseUrl';

export interface CreatePathaoParcelInput {
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientCity?: number;
  recipientZone?: number;
  recipientArea?: number;
  itemWeight?: number;
  itemQuantity?: number;
  amountToCollect?: number;
  deliveryType?: number;
  specialInstruction?: string;
}

export interface CreatePathaoParcelResult {
  success: boolean;
  consignmentId: string;
  pathaoStatus: string;
  deliveryFee: number;
}

export class PathaoParcelValidationError extends Error {
  missingFields: string[];

  constructor(message: string, missingFields: string[]) {
    super(message);
    this.name = 'PathaoParcelValidationError';
    this.missingFields = missingFields;
  }
}

export async function createPathaoParcel(
  orderId: number,
  input: CreatePathaoParcelInput,
): Promise<CreatePathaoParcelResult> {
  const token = tokenStore.getAccess();
  if (!token) {
    throw new Error('Not authenticated');
  }
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/admin/pathao/create-parcel/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    const missingFields = Array.isArray(json?.data?.missingFields)
      ? (json.data.missingFields as string[])
      : [];
    if (missingFields.length > 0) {
      throw new PathaoParcelValidationError(
        json?.message ?? 'Missing required Pathao fields',
        missingFields,
      );
    }
    throw new Error(json?.message ?? 'Failed to create Pathao parcel');
  }

  return json.data as CreatePathaoParcelResult;
}
