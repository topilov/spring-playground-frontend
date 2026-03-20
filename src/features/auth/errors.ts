import { ApiClientError } from '../../shared/api/apiClient';

function readResponseCode(responseBody: unknown): string | undefined {
  if (!responseBody || typeof responseBody !== 'object') {
    return undefined;
  }

  const maybeCode = Reflect.get(responseBody, 'code');
  return typeof maybeCode === 'string' && maybeCode.trim() ? maybeCode : undefined;
}

export function getAuthErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ApiClientError)) {
    return undefined;
  }

  return readResponseCode(error.responseBody);
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  return getAuthErrorCode(error) === 'EMAIL_NOT_VERIFIED';
}
