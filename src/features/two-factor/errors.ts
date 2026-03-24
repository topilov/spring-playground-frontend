import { ApiClientError } from '../../shared/api/apiClient';
import { getApiErrorMessage } from '../../shared/api/errorMessage';

export function isTwoFactorChallengeUnavailable(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 400;
}

export function getTwoFactorVerificationErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof ApiClientError && error.status === 401) {
    return 'That verification code was not accepted. Check it and try again.';
  }

  return getApiErrorMessage(error, fallback);
}
