import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { getCurrentProfile } from '../../profile/api';
import { getSessionStateFromError, type SessionState } from './sessionState';

export const authSessionQueryKey = ['auth', 'session'] as const;

export async function fetchAuthSession(): Promise<SessionState> {
  try {
    const profile = await getCurrentProfile();

    return {
      kind: 'authenticated',
      profile,
    };
  } catch (error) {
    const sessionState = getSessionStateFromError(error);

    if (sessionState) {
      return sessionState;
    }

    throw new Error(getApiErrorMessage(error, 'We could not load your current profile.'));
  }
}
