import { camelizeKeys, decamelizeKeys } from 'humps';

/** Recursively converts all object keys to snake_case. Passes FormData through unchanged. */
export function toSnakeCase(data: unknown): unknown {
  if (data instanceof FormData) return data;
  if (typeof data !== 'object' || data === null) return data;
  return decamelizeKeys(data as object);
}

/** Recursively converts all object keys to camelCase. */
export function toCamelCase(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return data;
  return camelizeKeys(data as object);
}
