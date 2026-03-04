import { userRepository } from '@/lib/di';
import type { User } from '@/domain/user/user.entity';
import type { UpdateUserPayload } from '@/domain/user/user.repository';

export async function updateProfile(payload: UpdateUserPayload): Promise<User> {
  return userRepository.updateMe(payload);
}
