import { createContext } from 'react';

import type { Profile } from '../../../entities/profile/model';
import type { LoginCredentials, SessionUser } from '../../../entities/session/model';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

export interface AuthSessionContextValue {
  errorMessage: string | null;
  isAuthenticated: boolean;
  login: (payload: LoginCredentials) => Promise<SessionUser>;
  logout: () => Promise<void>;
  profile: Profile | null;
  refreshSession: () => Promise<Profile | null>;
  status: SessionStatus;
}

export const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);
