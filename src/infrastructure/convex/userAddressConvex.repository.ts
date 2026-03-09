import { convex } from './convexClient';
import { asId, fromId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type {
  UserAddressDto,
  CreateAddressInput,
  UpdateAddressInput,
} from '@/shared/types/api.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAddress(a: any): UserAddressDto {
  return {
    id:          asId(a._id),
    userId:      asId(a.userId),
    name:        a.name ?? null,
    phone:       a.phone ?? null,
    addressLine: a.addressLine ?? '',
    city:        a.city ?? '',
    area:        a.area ?? null,
    postalCode:  a.postalCode ?? null,
    cityId:      a.cityId ?? null,
    zoneId:      a.zoneId ?? null,
    areaId:      a.areaId ?? null,
    isDefault:   a.isDefault,
    createdAt:   new Date(a._creationTime).toISOString(),
    updatedAt:   new Date(a._creationTime).toISOString(),
  };
}

export class UserAddressConvexRepository {
  async list(): Promise<UserAddressDto[]> {
    const userId = requireConvexUserId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.users.queries.getAddresses, { userId: userId as any });
    return res.map(mapAddress);
  }

  async create(payload: CreateAddressInput): Promise<UserAddressDto> {
    const userId = requireConvexUserId();
    const id = await convex.mutation(api.users.mutations.createAddress, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:      userId as any,
      addressLine: payload.addressLine,
      city:        payload.city,
      name:        payload.name ?? '',
      phone:       payload.phone ?? '',
      postalCode:  payload.postalCode,
      cityId:      payload.cityId,
      zoneId:      payload.zoneId,
      areaId:      payload.areaId,
      isDefault:   payload.isDefault,
    });
    // Fetch the created address
    const addresses = await this.list();
    const created = addresses.find((a) => fromId(a.id) === id);
    return created ?? addresses[0];
  }

  async update(id: number, payload: UpdateAddressInput): Promise<UserAddressDto> {
    const userId = requireConvexUserId();
    await convex.mutation(api.users.mutations.updateAddress, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addressId:   fromId(id) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:      userId as any,
      addressLine: payload.addressLine,
      city:        payload.city,
      name:        payload.name,
      phone:       payload.phone,
      postalCode:  payload.postalCode,
      cityId:      payload.cityId,
      zoneId:      payload.zoneId,
      areaId:      payload.areaId,
      isDefault:   payload.isDefault,
    });
    const addresses = await this.list();
    const updated = addresses.find((a) => a.id === id);
    return updated ?? addresses[0];
  }

  async delete(id: number): Promise<void> {
    const userId = requireConvexUserId();
    await convex.mutation(api.users.mutations.deleteAddress, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      addressId: fromId(id) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
    });
  }
}
