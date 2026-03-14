import type { User } from './user.entity';

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
}

export interface UserRepository {
  getMe(): Promise<User>;
  updateMe(payload: UpdateUserPayload): Promise<User>;
}
