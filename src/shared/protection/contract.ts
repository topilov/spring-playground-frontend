import { ApiClientError } from '../api/apiClient';
import { formatRetryAfter } from './formatRetryAfter';
import type { ProtectionKind, ProtectionResult } from './types';

function readObjectProperty(value: unknown, key: string): unknown {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return Reflect.get(value, key);
}

function readCode(responseBody: unknown): string | undefined {
  const maybeCode = readObjectProperty(responseBody, 'code');

  return typeof maybeCode === 'string' && maybeCode.trim() ? maybeCode.trim() : undefined;
}

function readRetryAfterSeconds(responseBody: unknown): number | undefined {
  const maybeRetryAfterSeconds = readObjectProperty(responseBody, 'retryAfterSeconds');

  return typeof maybeRetryAfterSeconds === 'number' && Number.isFinite(maybeRetryAfterSeconds)
    ? maybeRetryAfterSeconds
    : undefined;
}

function hasThrottledCode(code: string): boolean {
  return code === 'RATE_LIMITED' || code.endsWith('_THROTTLED');
}

function hasCooldownCode(code: string): boolean {
  return code === 'COOLDOWN_ACTIVE';
}

function hasProtectionFallbackCode(code: string): boolean {
  return code === 'PROTECTION_ERROR' || code === 'CAPTCHA_REQUIRED';
}

function getProtectionKind(
  status: number,
  code: string | undefined,
  retryAfterSeconds: number | undefined
): ProtectionKind | null {
  if (code === 'CAPTCHA_INVALID') {
    return 'captcha_invalid';
  }

  if (code && hasCooldownCode(code)) {
    return 'cooldown_active';
  }

  if (code && hasThrottledCode(code)) {
    return 'rate_limited';
  }

  if (code && hasProtectionFallbackCode(code)) {
    return 'protection_error';
  }

  return null;
}

export function getProtectionResultFromError(error: unknown): ProtectionResult | null {
  if (!(error instanceof ApiClientError)) {
    return null;
  }

  const code = readCode(error.responseBody);
  const retryAfterSeconds = readRetryAfterSeconds(error.responseBody);
  const kind = getProtectionKind(error.status, code, retryAfterSeconds);

  if (!kind) {
    return null;
  }

  const retryAfterText = formatRetryAfter(retryAfterSeconds);

  return {
    kind,
    ...(retryAfterSeconds !== undefined ? { retryAfterSeconds } : {}),
    ...(retryAfterText !== undefined ? { retryAfterText } : {}),
  };
}
