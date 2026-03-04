export interface User {
  id: number;
  phone: string;
  email: string | null;
  fullName: string | null;
  username: string | null;
  role: 'buyer' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  avatarUrl: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
}
