import { addressRepository } from '@/lib/di';
import type { UserAddressDto, CreateAddressInput, UpdateAddressInput } from '@/shared/types/api.types';
import { getAddressLengthError } from '@/shared/utils/addressValidation';

export async function getAddresses(): Promise<UserAddressDto[]> {
  return addressRepository.list();
}

export async function createAddress(payload: CreateAddressInput): Promise<UserAddressDto> {
  const addressError = getAddressLengthError(payload.addressLine);
  if (addressError) throw new Error(addressError);
  return addressRepository.create(payload);
}

export async function updateAddress(id: number, payload: UpdateAddressInput): Promise<UserAddressDto> {
  if (typeof payload.addressLine === 'string') {
    const addressError = getAddressLengthError(payload.addressLine);
    if (addressError) throw new Error(addressError);
  }
  return addressRepository.update(id, payload);
}

export async function deleteAddress(id: number): Promise<void> {
  return addressRepository.delete(id);
}
