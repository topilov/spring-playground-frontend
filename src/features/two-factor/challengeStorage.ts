import { isAppPath, routePaths } from '../../shared/routing/paths';

const pendingTwoFactorLoginChallengeKey = 'pending-two-factor-login-challenge';

export interface PendingTwoFactorLoginChallenge {
  loginChallengeId: string;
  methods: string[];
  expiresAt: string;
  redirectTo: (typeof routePaths)[keyof typeof routePaths];
}

function isExpired(expiresAt: string): boolean {
  const expiresAtValue = Date.parse(expiresAt);

  return Number.isNaN(expiresAtValue) || expiresAtValue <= Date.now();
}

function isPendingTwoFactorLoginChallenge(
  value: unknown
): value is PendingTwoFactorLoginChallenge {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const loginChallengeId = Reflect.get(value, 'loginChallengeId');
  const methods = Reflect.get(value, 'methods');
  const expiresAt = Reflect.get(value, 'expiresAt');
  const redirectTo = Reflect.get(value, 'redirectTo');

  return (
    typeof loginChallengeId === 'string' &&
    loginChallengeId.trim().length > 0 &&
    Array.isArray(methods) &&
    methods.every((method) => typeof method === 'string') &&
    typeof expiresAt === 'string' &&
    expiresAt.trim().length > 0 &&
    isAppPath(redirectTo)
  );
}

export function savePendingTwoFactorLoginChallenge(
  challenge: PendingTwoFactorLoginChallenge
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    pendingTwoFactorLoginChallengeKey,
    JSON.stringify(challenge)
  );
}

export function loadPendingTwoFactorLoginChallenge(): PendingTwoFactorLoginChallenge | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const serialized = window.sessionStorage.getItem(pendingTwoFactorLoginChallengeKey);

  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as unknown;

    if (!isPendingTwoFactorLoginChallenge(parsed) || isExpired(parsed.expiresAt)) {
      clearPendingTwoFactorLoginChallenge();
      return null;
    }

    return parsed;
  } catch {
    clearPendingTwoFactorLoginChallenge();
    return null;
  }
}

export function clearPendingTwoFactorLoginChallenge() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(pendingTwoFactorLoginChallengeKey);
}
