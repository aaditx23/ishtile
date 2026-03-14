export const PHONE_LENGTH = 11;

export function normalizePhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_LENGTH);
}

export function isValidPhone11Digits(value: string): boolean {
  return /^\d{11}$/.test(value.trim());
}

export function getPhone11DigitError(value: string): string | null {
  if (!value.trim()) return null;
  if (!isValidPhone11Digits(value)) return 'Phone number must be exactly 11 digits.';
  return null;
}