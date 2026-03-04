'use client';

import { useEffect, useState } from 'react';
import { getProfile } from '@/application/user/getProfile';
import type { User } from '@/domain/user/user.entity';
import { tokenStore } from '@/infrastructure/auth/tokenStore';

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: User };

/**
 * Returns the current user and their role.
 * Skips the API call entirely when no session exists.
 */
export function useCurrentUser(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    if (!tokenStore.getRefresh()) {
      setState({ status: 'unauthenticated' });
      return;
    }

    let cancelled = false;
    getProfile()
      .then((user) => {
        if (!cancelled) setState({ status: 'authenticated', user });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unauthenticated' });
      });

    return () => { cancelled = true; };
  }, []);

  return state;
}
