import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  clearPendingTwoFactorLoginChallenge,
  loadPendingTwoFactorLoginChallenge,
} from '../../features/two-factor/challengeStorage';
import {
  getTwoFactorVerificationErrorMessage,
  isTwoFactorChallengeUnavailable,
} from '../../features/two-factor/errors';
import {
  useVerifyTwoFactorBackupCodeMutation,
  useVerifyTwoFactorLoginMutation,
} from '../../features/two-factor/hooks';
import { ProtectedStatusBanner } from '../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../shared/protection/useProtectedAction';
import { appConfig } from '../../shared/config/appConfig';
import { routePaths } from '../../shared/routing/paths';
import { AppLink } from '../../shared/routing/AppLink';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

function formatExpiry(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function TwoFactorLoginPage() {
  const navigate = useNavigate();
  const verifyTwoFactorLoginMutation = useVerifyTwoFactorLoginMutation();
  const verifyTwoFactorBackupCodeMutation = useVerifyTwoFactorBackupCodeMutation();
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    enabled: appConfig.captchaRequired,
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });
  const challenge = useMemo(() => loadPendingTwoFactorLoginChallenge(), []);
  const [method, setMethod] = useState<'TOTP' | 'BACKUP_CODE'>('TOTP');
  const [code, setCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!challenge) {
      clearPendingTwoFactorLoginChallenge();
      navigate(routePaths.login, {
        replace: true,
        state: {
          authNotice: 'Your verification step is missing or expired. Sign in again.',
        },
      });
    }
  }, [challenge, navigate]);

  if (!challenge) {
    return (
      <AuthPageShell
        subtitle="Redirecting back to the first sign-in step."
        title="Two-factor verification"
      />
    );
  }

  const backupCodeEnabled = challenge.methods.includes('BACKUP_CODE');
  const isSubmitting =
    verifyTwoFactorLoginMutation.isPending || verifyTwoFactorBackupCodeMutation.isPending;

  const resetToLogin = () => {
    clearPendingTwoFactorLoginChallenge();
    navigate(routePaths.login, {
      replace: true,
      state: {
        authNotice: 'Your verification step is no longer valid. Sign in again.',
      },
    });
  };

  const handleVerifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!code.trim()) {
      setActionError('Enter the code from your authenticator app.');
      return;
    }

    setActionError('');
    protectedAction.resetStatus();

    try {
      await protectedAction.execute({
        execute: (captchaToken) =>
          verifyTwoFactorLoginMutation.mutateAsync({
            loginChallengeId: challenge.loginChallengeId,
            code,
            captchaToken,
          }),
      });
      clearPendingTwoFactorLoginChallenge();
      navigate(challenge.redirectTo, {
        replace: true,
      });
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

      if (isTwoFactorChallengeUnavailable(error)) {
        resetToLogin();
        return;
      }

      setActionError(
        getTwoFactorVerificationErrorMessage(
          error,
          'We could not complete this verification step.'
        )
      );
    }
  };

  const handleVerifyBackupCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!backupCode.trim()) {
      setActionError('Enter one of your backup codes.');
      return;
    }

    setActionError('');
    protectedAction.resetStatus();

    try {
      await protectedAction.execute({
        execute: (captchaToken) =>
          verifyTwoFactorBackupCodeMutation.mutateAsync({
            loginChallengeId: challenge.loginChallengeId,
            backupCode,
            captchaToken,
          }),
      });
      clearPendingTwoFactorLoginChallenge();
      navigate(challenge.redirectTo, {
        replace: true,
      });
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

      if (isTwoFactorChallengeUnavailable(error)) {
        resetToLogin();
        return;
      }

      setActionError(
        getTwoFactorVerificationErrorMessage(
          error,
          'We could not verify that backup code.'
        )
      );
    }
  };

  return (
    <AuthPageShell
      footer={
        <div className="auth-links auth-links-start">
          <AppLink className="text-link" to={routePaths.login}>
            Back to sign in
          </AppLink>
        </div>
      }
      subtitle="Finish password sign-in with your authenticator app or a one-time backup code."
      utility={
        <div className="stack">
          <p className="status-banner" role="status">
            This verification step expires at {formatExpiry(challenge.expiresAt)}.
          </p>
          {actionError ? (
            <p className="status-banner status-error" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      }
      title="Two-factor verification"
    >
      {backupCodeEnabled ? (
        <div className="inline-actions">
          <button
            className={method === 'TOTP' ? 'button button-primary' : 'button button-secondary'}
            onClick={() => setMethod('TOTP')}
            type="button"
          >
            Use authenticator code
          </button>
          <button
            className={
              method === 'BACKUP_CODE' ? 'button button-primary' : 'button button-secondary'
            }
            onClick={() => setMethod('BACKUP_CODE')}
            type="button"
          >
            Use backup code
          </button>
        </div>
      ) : null}

      {method === 'TOTP' ? (
        <form className="stack" onSubmit={handleVerifyCode}>
          <label className="field">
            <span>Authenticator code</span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              value={code}
            />
          </label>

          <TurnstileWidget controller={turnstileController} />
          <ProtectedStatusBanner
            errorMessage={protectedAction.errorMessage}
            protection={protectedAction.protection}
          />

          <button className="button button-primary button-full" disabled={isSubmitting} type="submit">
            {verifyTwoFactorLoginMutation.isPending ? 'Verifying code...' : 'Verify code'}
          </button>
        </form>
      ) : null}

      {method === 'BACKUP_CODE' ? (
        <form className="stack" onSubmit={handleVerifyBackupCode}>
          <label className="field">
            <span>Backup code</span>
            <input
              autoCapitalize="characters"
              onChange={(event) => setBackupCode(event.target.value)}
              placeholder="ABCD-EFGH-JKLM"
              value={backupCode}
            />
          </label>

          <TurnstileWidget controller={turnstileController} />
          <ProtectedStatusBanner
            errorMessage={protectedAction.errorMessage}
            protection={protectedAction.protection}
          />

          <button className="button button-primary button-full" disabled={isSubmitting} type="submit">
            {verifyTwoFactorBackupCodeMutation.isPending
              ? 'Verifying backup code...'
              : 'Verify backup code'}
          </button>
        </form>
      ) : null}
    </AuthPageShell>
  );
}
