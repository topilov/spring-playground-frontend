import type { Profile } from '../../../entities/profile/model';
import { ApiClientError } from '../../../shared/api/apiClient';

const missingProfileReason =
  'Your account is signed in, but the backend did not return a profile.';

export type SessionState =
  | {
      kind: 'authenticated';
      profile: Profile;
    }
  | {
      kind: 'anonymous';
      profile: null;
    }
  | {
      kind: 'missing-profile';
      profile: null;
      reason: string;
    };

export function getSessionStateFromError(error: unknown): Exclude<
  SessionState,
  { kind: 'authenticated' }
> | null {
  if (!(error instanceof ApiClientError)) {
    return null;
  }

  if (error.status === 401) {
    return {
      kind: 'anonymous',
      profile: null,
    };
  }

  if (error.status === 404) {
    return {
      kind: 'missing-profile',
      profile: null,
      reason: missingProfileReason,
    };
  }

  return null;
}
