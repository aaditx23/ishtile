/**
 * ID bridging helpers.
 *
 * Convex uses opaque string IDs. The domain layer expects numeric IDs
 * (inherited from the FastAPI backend). These helpers cast between them
 * at the infrastructure boundary — the domain sees numbers, Convex sees
 * strings, and JS doesn't care at runtime since both are primitives.
 *
 * All Convex IDs stored in domain entities are actually strings at runtime.
 * This is intentional for the migration period.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asId = (id: string): number => id as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fromId = (id: number): string => id as any;

/** Build a Pagination object from Convex paginated query result. */
export function buildPagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize) || 1;
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
