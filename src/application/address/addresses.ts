import { addressRepository } from '@/lib/di';
import type { UserAddressDto, CreateAddressInput, UpdateAddressInput } from '@/shared/types/api.types';

export async function getAddresses(): Promise<UserAddressDto[]> {
  return addressRepository.list();
}

export async function createAddress(payload: CreateAddressInput): Promise<UserAddressDto> {
  return addressRepository.create(payload);
}

export async function updateAddress(id: number, payload: UpdateAddressInput): Promise<UserAddressDto> {
  return addressRepository.update(id, payload);
}

export async function deleteAddress(id: number): Promise<void> {
  return addressRepository.delete(id);
}
