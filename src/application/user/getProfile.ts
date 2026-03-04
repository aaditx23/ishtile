import { userRepository } from '@/lib/di';
import type { User } from '@/domain/user/user.entity';

export async function getProfile(): Promise<User> {
  return userRepository.getMe();
}
