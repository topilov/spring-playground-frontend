import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import type { Profile } from '../../../entities/profile/model';
import type { LoginCredentials, SessionUser } from '../../../entities/session/model';
import { ApiClientError } from '../../../shared/api/apiClient';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { getCurrentProfile } from '../../profile/api';
import { login as loginRequest, logout as logoutRequest } from '../api';
import { AuthSessionContext, type SessionStatus } from './context';

async function loadProfile() {
  return getCurrentProfile();
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshSession = async (): Promise<Profile | null> => {
    try {
      const nextProfile = await loadProfile();
      setProfile(nextProfile);
      setStatus('authenticated');
      setErrorMessage(null);
      return nextProfile;
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        setProfile(null);
        setStatus('anonymous');
        setErrorMessage(null);
        return null;
      }

      if (error instanceof ApiClientError && error.status === 404) {
        setProfile(null);
        setStatus('error');
        setErrorMessage(
          'Your account is signed in, but the backend did not return a profile.'
        );
        return null;
      }

      setProfile(null);
      setStatus('error');
      setErrorMessage(
        getApiErrorMessage(error, 'We could not load your current profile.')
      );
      return null;
    }
  };

  useEffect(() => {
    let isCancelled = false;

    void loadProfile()
      .then((nextProfile) => {
        if (isCancelled) {
          return;
        }

        setProfile(nextProfile);
        setStatus('authenticated');
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        if (error instanceof ApiClientError && error.status === 401) {
          setProfile(null);
          setStatus('anonymous');
          setErrorMessage(null);
          return;
        }

        if (error instanceof ApiClientError && error.status === 404) {
          setProfile(null);
          setStatus('error');
          setErrorMessage(
            'Your account is signed in, but the backend did not return a profile.'
          );
          return;
        }

        setProfile(null);
        setStatus('error');
        setErrorMessage(
          getApiErrorMessage(error, 'We could not load your current profile.')
        );
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = async (payload: LoginCredentials): Promise<SessionUser> => {
    const sessionUser = await loginRequest(payload);
    await refreshSession();
    return sessionUser;
  };

  const logout = async (): Promise<void> => {
    await logoutRequest();
    setProfile(null);
    setStatus('anonymous');
    setErrorMessage(null);
  };

  return (
    <AuthSessionContext.Provider
      value={{
        errorMessage,
        isAuthenticated: status === 'authenticated',
        login,
        logout,
        profile,
        refreshSession,
        status,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}
