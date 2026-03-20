import { ApiClientError } from './apiClient';

function readBodyError(responseBody: unknown): string | undefined {
  if (!responseBody || typeof responseBody !== 'object') {
    return undefined;
  }

  const maybeError = Reflect.get(responseBody, 'error');
  return typeof maybeError === 'string' && maybeError.trim()
    ? maybeError
    : undefined;
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (error instanceof ApiClientError) {
    const responseError = readBodyError(error.responseBody);

    if (responseError) {
      return responseError;
    }

    if (error.status === 401) {
      return 'Your session is missing or expired. Please log in again.';
    }

    if (error.statusText) {
      return `${fallback} (${error.status} ${error.statusText})`;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
