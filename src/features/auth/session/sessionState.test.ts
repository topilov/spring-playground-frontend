import { describe, expect, it } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../../shared/api/apiClient';
import { getSessionStateFromError } from './sessionState';

describe('getSessionStateFromError', () => {
  it('treats 401 responses as an anonymous session', () => {
    expect(
      getSessionStateFromError(
        new ApiClientError({
          status: 401,
          statusText: 'Unauthorized',
          url: buildApiUrl('/api/profile/me'),
        })
      )
    ).toEqual({
      kind: 'anonymous',
      profile: null,
    });
  });

  it('treats 404 responses as an authenticated user without a profile', () => {
    expect(
      getSessionStateFromError(
        new ApiClientError({
          status: 404,
          statusText: 'Not Found',
          url: buildApiUrl('/api/profile/me'),
        })
      )
    ).toEqual({
      kind: 'missing-profile',
      profile: null,
      reason: 'Your account is signed in, but the backend did not return a profile.',
    });
  });

  it('returns null for unrelated failures so the caller can surface a real error state', () => {
    expect(
      getSessionStateFromError(
        new ApiClientError({
          status: 500,
          statusText: 'Internal Server Error',
          url: buildApiUrl('/api/profile/me'),
        })
      )
    ).toBeNull();
  });
});
