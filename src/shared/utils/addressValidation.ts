export const ADDRESS_MIN_LENGTH = 10;
export const ADDRESS_MAX_LENGTH = 220;

export function isAddressLengthValid(address: string): boolean {
  const len = address.trim().length;
  return len >= ADDRESS_MIN_LENGTH && len <= ADDRESS_MAX_LENGTH;
}

export function getAddressLengthError(address: string): string | null {
  const len = address.trim().length;
  if (len < ADDRESS_MIN_LENGTH) {
    return `Address must be at least ${ADDRESS_MIN_LENGTH} characters.`;
  }
  if (len > ADDRESS_MAX_LENGTH) {
    return `Address must be at most ${ADDRESS_MAX_LENGTH} characters.`;
  }
  return null;
}
