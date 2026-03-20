import { describe, expect, it } from 'vitest';

import { ApiClientError } from '../../shared/api/apiClient';
import { getAuthErrorCode, isEmailNotVerifiedError } from './errors';

describe('auth error helpers', () => {
  it('extracts the backend auth error code from an API error response', () => {
    const error = new ApiClientError({
      status: 401,
      statusText: 'Unauthorized',
      url: 'http://localhost:8080/api/auth/login',
      responseBody: {
        error: 'Email is not verified',
        code: 'EMAIL_NOT_VERIFIED',
      },
    });

    expect(getAuthErrorCode(error)).toBe('EMAIL_NOT_VERIFIED');
  });

  it('detects the email-not-verified backend error', () => {
    const error = new ApiClientError({
      status: 401,
      statusText: 'Unauthorized',
      url: 'http://localhost:8080/api/auth/login',
      responseBody: {
        error: 'Email is not verified',
        code: 'EMAIL_NOT_VERIFIED',
      },
    });

    expect(isEmailNotVerifiedError(error)).toBe(true);
  });

  it('ignores unrelated errors', () => {
    const error = new ApiClientError({
      status: 401,
      statusText: 'Unauthorized',
      url: 'http://localhost:8080/api/auth/login',
      responseBody: {
        error: 'Bad credentials',
      },
    });

    expect(getAuthErrorCode(error)).toBeUndefined();
    expect(isEmailNotVerifiedError(error)).toBe(false);
  });
});
