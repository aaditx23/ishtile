'use client';

import { useEffect, useState } from 'react';
import { cartRepository } from '@/lib/di';

/**
 * Returns the live cart item count.
 * Returns 0 when the user is not logged in or on error.
 */
export function useCartCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const cart = await cartRepository.getCart();
        if (!cancelled) {
          setCount(cart.totalItems);
        }
      } catch {
        // Unauthenticated or error — keep 0
        if (!cancelled) setCount(0);
      }
    };

    void fetchCount();

    const handleCartUpdate = () => { void fetchCount(); };
    window.addEventListener('CART_UPDATED', handleCartUpdate);

    return () => {
      cancelled = true;
      window.removeEventListener('CART_UPDATED', handleCartUpdate);
    };
  }, []);

  return count;
}
