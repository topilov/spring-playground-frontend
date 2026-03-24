import { describe, expect, it } from 'vitest';

import { ApiClientError, buildApiUrl } from '../api/apiClient';
import { getProtectionResultFromError } from './contract';

describe('getProtectionResultFromError', () => {
  it('normalizes captcha validation failures to captcha_invalid', () => {
    const error = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      },
    });

    expect(getProtectionResultFromError(error)).toEqual({
      kind: 'captcha_invalid',
    });
  });

  it('does not classify a bare 429 without protection-specific signal', () => {
    const error = new ApiClientError({
      status: 429,
      statusText: 'Too Many Requests',
      url: buildApiUrl('/api/auth/login'),
      responseBody: { error: 'Too many requests.' },
    });

    expect(getProtectionResultFromError(error)).toBeNull();
  });

  it('does not classify 429 retry timing without a protection-specific code', () => {
    const error = new ApiClientError({
      status: 429,
      statusText: 'Too Many Requests',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Too many requests.',
        retryAfterSeconds: 45,
      },
    });

    expect(getProtectionResultFromError(error)).toBeNull();
  });

  it('normalizes cooldown responses to cooldown_active', () => {
    const error = new ApiClientError({
      status: 429,
      statusText: 'Too Many Requests',
      url: buildApiUrl('/api/auth/resend-verification-email'),
      responseBody: {
        error: 'Cooldown is active.',
        code: 'COOLDOWN_ACTIVE',
        retryAfterSeconds: 120,
      },
    });

    expect(getProtectionResultFromError(error)).toEqual({
      kind: 'cooldown_active',
      retryAfterSeconds: 120,
      retryAfterText: 'Try again in 2 minutes.',
    });
  });

  it('leaves unrelated domain errors unclassified', () => {
    const error = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/reset-password'),
      responseBody: {
        error: 'Invalid reset token.',
        code: 'INVALID_RESET_TOKEN',
      },
    });

    expect(getProtectionResultFromError(error)).toBeNull();
  });

  it('falls back to protection_error for protection-family codes', () => {
    const error = new ApiClientError({
      status: 400,
      statusText: 'Bad Request',
      url: buildApiUrl('/api/auth/login'),
      responseBody: {
        error: 'Captcha challenge required.',
        code: 'CAPTCHA_REQUIRED',
      },
    });

    expect(getProtectionResultFromError(error)).toEqual({
      kind: 'protection_error',
    });
  });
});
