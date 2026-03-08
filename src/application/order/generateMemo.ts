import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { MemoDto } from '@/shared/types/api.types';
import type { DataResponse } from '@/shared/types/api.types';

export async function generateMemo(orderId: number): Promise<MemoDto> {
  const res = await apiClient.post<DataResponse<MemoDto>>(
    ENDPOINTS.admin.memos.generate(orderId),
  );
  return res.data;
}
