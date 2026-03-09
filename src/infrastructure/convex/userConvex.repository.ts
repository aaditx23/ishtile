import { convex } from './convexClient';
import { asId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type { UserRepository, UpdateUserPayload } from '@/domain/user/user.repository';
import type { User } from '@/domain/user/user.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapUser(u: any): User {
  return {
    id:          asId(u._id),
    phone:       u.phone ?? '',
    email:       u.email ?? null,
    fullName:    u.fullName ?? null,
    username:    u.username ?? null,
    role:        u.role as User['role'],
    isActive:    u.isActive,
    isVerified:  u.isVerified,
    avatarUrl:   u.avatarUrl ?? null,
    addressLine: u.addressLine ?? null,
    city:        u.city ?? null,
    postalCode:  u.postalCode ?? null,
  };
}

export class UserConvexRepository implements UserRepository {
  async getMe(): Promise<User> {
    const userId = requireConvexUserId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.users.queries.getMe, { userId: userId as any });
    if (!res) throw new Error('User not found');
    return mapUser(res);
  }

  async updateMe(payload: UpdateUserPayload): Promise<User> {
    const userId = requireConvexUserId();
    await convex.mutation(api.users.mutations.updateMe, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:   userId as any,
      fullName: payload.fullName,
      email:    payload.email,
    });
    // Re-fetch to return updated user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.users.queries.getMe, { userId: userId as any });
    if (!res) throw new Error('User not found');
    return mapUser(res);
  }
}
