export function getBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!value) {
    throw new Error('NEXT_PUBLIC_BASE_URL is not configured');
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

// Backward-compatible alias for existing callers.
export const getPublicBaseUrl = getBaseUrl;
