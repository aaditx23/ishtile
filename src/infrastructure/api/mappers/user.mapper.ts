import type { UserDto } from '@/shared/types/api.types';
import type { User } from '@/domain/user/user.entity';

export function mapUser(dto: UserDto): User {
  return {
    id:          dto.id,
    phone:       dto.phone,
    email:       dto.email,
    fullName:    dto.fullName,
    username:    dto.username,
    role:        dto.role as User['role'],
    isActive:    dto.isActive,
    isVerified:  dto.isVerified,
    avatarUrl:   dto.avatarUrl,
    addressLine: dto.addressLine,
    city:        dto.city,
    postalCode:  dto.postalCode,
  };
}
