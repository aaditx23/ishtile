'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { GetCartResponse } from '@/shared/types/api.types';

/**
 * Returns the live cart item count.
 * Returns 0 when the user is not logged in or on error.
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = () => {
      apiClient
        .get<GetCartResponse>(ENDPOINTS.cart.root)
        .then((res) => {
          if (!cancelled) setCount(res.data.totalItems ?? 0);
        })
        .catch(() => {
          // Unauthenticated or network error — silently keep 0
        });
    };

    fetchCount();

    const handleCartUpdate = () => fetchCount();
    window.addEventListener('CART_UPDATED', handleCartUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('CART_UPDATED', handleCartUpdate);
    };
  }, []);

  return count;
}
