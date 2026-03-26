import { ApiClientError } from '../../shared/api/apiClient';
import { getApiErrorMessage } from '../../shared/api/errorMessage';

function readTelegramErrorCode(error: unknown): string | undefined {
  if (!(error instanceof ApiClientError) || !error.responseBody || typeof error.responseBody !== 'object') {
    return undefined;
  }

  const maybeCode = Reflect.get(error.responseBody, 'code');
  return typeof maybeCode === 'string' && maybeCode.trim() ? maybeCode : undefined;
}

export function getTelegramErrorMessage(error: unknown, fallback: string): string {
  const code = readTelegramErrorCode(error);

  switch (code) {
    case 'TELEGRAM_INVALID_AUTH_STEP':
      return 'That Telegram step is no longer valid. Start again.';
    case 'TELEGRAM_PENDING_AUTH_NOT_FOUND':
      return 'That Telegram sign-in step expired. Start again.';
    case 'TELEGRAM_MODE_INVALID':
      return 'Enter a valid mode name and emoji status.';
    case 'TELEGRAM_MODE_ALREADY_EXISTS':
      return 'That Telegram mode already exists.';
    case 'TELEGRAM_MODE_NOT_FOUND':
      return 'That Telegram mode no longer exists. Refresh and try again.';
    case 'TELEGRAM_NOT_CONNECTED':
      return 'Connect Telegram before using that action.';
    case 'TELEGRAM_PREMIUM_REQUIRED':
      return 'Telegram Premium is required for emoji status sync.';
    case 'TELEGRAM_AUTOMATION_TOKEN_INVALID':
      return 'That automation token is no longer valid.';
    case 'RATE_LIMITED':
      return 'Too many attempts right now. Try again shortly.';
    default:
      return getApiErrorMessage(error, fallback);
  }
}
