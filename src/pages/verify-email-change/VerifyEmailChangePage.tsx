import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { verifyCurrentEmailChange } from '../../features/profile/api';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { ProtectedStatusBanner } from '../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../shared/protection/useProtectedAction';
import { appConfig } from '../../shared/config/appConfig';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { getQueryParamValue } from '../../shared/routing/queryParams';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

type VerificationStatus = 'idle' | 'ready' | 'submitting' | 'verified' | 'failed';

function getShellSubtitle(status: VerificationStatus, hasToken: boolean) {
  if (status === 'verified') {
    return 'Email change confirmed. Return to settings or continue with the refreshed account.';
  }

  if (hasToken) {
    return 'Finish the email change confirmation from the one-time link.';
  }

  return 'Open the email-change link from your new inbox to complete the update.';
}

export function VerifyEmailChangePage() {
  const location = useLocation();
  const { refreshSession } = useAuthSession();
  const [token] = useState(() => getQueryParamValue(location.search, 'token')?.trim() ?? '');
  const [verificationError, setVerificationError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    token ? 'ready' : 'idle'
  );
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    enabled: appConfig.captchaRequired,
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });

  const handleVerification = async () => {
    if (!token) {
      return;
    }

    protectedAction.resetStatus();
    setVerificationError('');
    setVerificationStatus('submitting');

    try {
      await protectedAction.execute({
        execute: async (captchaToken) => {
          await verifyCurrentEmailChange({
            token,
            captchaToken,
          });
          await refreshSession();
        },
      });
      setVerificationStatus('verified');
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        setVerificationStatus('ready');
        return;
      }

      setVerificationStatus('failed');
      setVerificationError(
        getApiErrorMessage(error, 'We could not verify this email change link.')
      );
    }
  };

  const isSubmitting = verificationStatus === 'submitting';
  const isVerified = verificationStatus === 'verified';

  return (
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.settingsAccount}>
            Back to account settings
          </AppLink>
          <AppLink className="text-link" to={routePaths.profile}>
            Profile
          </AppLink>
        </div>
      }
      subtitle={getShellSubtitle(verificationStatus, Boolean(token))}
      utility={
        <div className="stack">
          {verificationStatus === 'verified' ? (
            <p className="status-banner status-success" role="status">
              Email change verified. Your account email is now updated.
            </p>
          ) : null}

          {verificationStatus === 'failed' ? (
            <p className="status-banner status-error" role="alert">
              {verificationError}
            </p>
          ) : null}

          {verificationStatus === 'idle' ? (
            <p className="status-banner" role="status">
              This verification link is missing or incomplete.
            </p>
          ) : null}
        </div>
      }
      title="Verify email change"
    >
      <div className="stack">
        <p className="page-description">
          Use the verification link from the new email address to finish updating your account.
        </p>

        {token ? (
          <div className="stack">
            <TurnstileWidget controller={turnstileController} />
            <ProtectedStatusBanner
              errorMessage={protectedAction.errorMessage}
              protection={protectedAction.protection}
            />

            <button
              className="button button-primary button-full"
              disabled={isSubmitting || isVerified}
              onClick={() => void handleVerification()}
              type="button"
            >
              {isSubmitting ? 'Verifying email change...' : 'Verify email change'}
            </button>
          </div>
        ) : null}
      </div>
    </AuthPageShell>
  );
}
