import { useQuery } from '@tanstack/react-query';

import type { Profile } from '../../../entities/profile/model';
import { authSessionQueryKey, fetchAuthSession } from './query';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

export interface AuthSessionState {
  errorMessage: string | null;
  isAuthenticated: boolean;
  profile: Profile | null;
  refreshSession: () => Promise<Profile | null>;
  status: SessionStatus;
}

export function useAuthSession(): AuthSessionState {
  const sessionQuery = useQuery({
    queryKey: authSessionQueryKey,
    queryFn: fetchAuthSession,
    retry: false,
  });

  if (sessionQuery.isPending) {
    return {
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: async () => null,
      status: 'loading',
    };
  }

  if (sessionQuery.isError) {
    return {
      errorMessage: sessionQuery.error.message,
      isAuthenticated: false,
      profile: null,
      refreshSession: async () => {
        const result = await sessionQuery.refetch();
        return result.data?.kind === 'authenticated' ? result.data.profile : null;
      },
      status: 'error',
    };
  }

  if (sessionQuery.data.kind === 'authenticated') {
    return {
      errorMessage: null,
      isAuthenticated: true,
      profile: sessionQuery.data.profile,
      refreshSession: async () => {
        const result = await sessionQuery.refetch();
        return result.data?.kind === 'authenticated' ? result.data.profile : null;
      },
      status: 'authenticated',
    };
  }

  if (sessionQuery.data.kind === 'missing-profile') {
    return {
      errorMessage: sessionQuery.data.reason,
      isAuthenticated: false,
      profile: null,
      refreshSession: async () => {
        const result = await sessionQuery.refetch();
        return result.data?.kind === 'authenticated' ? result.data.profile : null;
      },
      status: 'error',
    };
  }

  return {
    errorMessage: null,
    isAuthenticated: false,
    profile: null,
    refreshSession: async () => {
      const result = await sessionQuery.refetch();
      return result.data?.kind === 'authenticated' ? result.data.profile : null;
    },
    status: 'anonymous',
  };
}
