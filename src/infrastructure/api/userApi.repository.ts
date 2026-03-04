import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapUser } from './mappers/user.mapper';
import type { UserRepository, UpdateUserPayload } from '@/domain/user/user.repository';
import type { User } from '@/domain/user/user.entity';
import type { GetProfileResponse, UpdateProfileResponse } from '@/shared/types/api.types';

export class UserApiRepository implements UserRepository {
  async getMe(): Promise<User> {
    const res = await apiClient.get<GetProfileResponse>(ENDPOINTS.users.me);
    return mapUser(res.data);
  }

  async updateMe(payload: UpdateUserPayload): Promise<User> {
    const res = await apiClient.put<UpdateProfileResponse>(ENDPOINTS.users.me, payload);
    return mapUser(res.data);
  }
}
