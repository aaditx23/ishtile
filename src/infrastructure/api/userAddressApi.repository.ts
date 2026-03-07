import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  UserAddressDto,
  CreateAddressInput,
  UpdateAddressInput,
  ListAddressesResponse,
  CreateAddressResponse,
  UpdateAddressResponse,
  DeleteAddressResponse,
} from '@/shared/types/api.types';

export class UserAddressApiRepository {
  async list(): Promise<UserAddressDto[]> {
    const res = await apiClient.get<ListAddressesResponse>(ENDPOINTS.users.addresses);
    return res.listData ?? [];
  }

  async create(payload: CreateAddressInput): Promise<UserAddressDto> {
    const res = await apiClient.post<CreateAddressResponse>(ENDPOINTS.users.addresses, payload);
    return res.data;
  }

  async update(id: number, payload: UpdateAddressInput): Promise<UserAddressDto> {
    const res = await apiClient.put<UpdateAddressResponse>(ENDPOINTS.users.address(id), payload);
    return res.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<DeleteAddressResponse>(ENDPOINTS.users.address(id));
  }
}
