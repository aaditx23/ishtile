import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { getBaseUrl } from '@/shared/config/baseUrl';

export interface RefreshPathaoStatusResult {
  consignmentId: string;
  pathaoStatus: string;
  orderInfo?: unknown;
}

export async function refreshPathaoStatus(consignmentId: string): Promise<RefreshPathaoStatusResult> {
  const token = tokenStore.getAccess();
  if (!token) {
    throw new Error('Not authenticated');
  }
  const baseUrl = getBaseUrl();

  const res = await fetch(`${baseUrl}/api/admin/pathao/status/${encodeURIComponent(consignmentId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Failed to refresh Pathao status');
  }

  // The API returns { success, pathaoStatus } directly at the root — not nested under `data`.
  // Guard with ?? so callers always receive a string even if the field is missing.
  return {
    consignmentId,
    pathaoStatus: json.pathaoStatus ?? json.data?.pathaoStatus ?? 'Pending',
    orderInfo: json.data,
  };
}
