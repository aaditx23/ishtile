import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ActionResponse } from '@/shared/types/api.types';

export interface CreateAdminPayload {
  phone?: string;
  email: string;
  username: string;
  fullName: string;
  password: string;
}

export async function createAdmin(payload: CreateAdminPayload): Promise<void> {
  await apiClient.post<ActionResponse>(ENDPOINTS.admin.createAdmin, payload);
}
