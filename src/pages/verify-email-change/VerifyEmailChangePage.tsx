import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { verifyCurrentEmailChange } from '../../features/profile/api';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { getQueryParamValue } from '../../shared/routing/queryParams';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed';

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
    token ? 'verifying' : 'idle'
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const runVerification = async () => {
      try {
        await verifyCurrentEmailChange({ token });
        await refreshSession();

        if (!cancelled) {
          setVerificationStatus('verified');
        }
      } catch (error) {
        if (!cancelled) {
          setVerificationStatus('failed');
          setVerificationError(
            getApiErrorMessage(error, 'We could not verify this email change link.')
          );
        }
      }
    };

    void runVerification();

    return () => {
      cancelled = true;
    };
  }, [refreshSession, token]);

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
          {verificationStatus === 'verifying' ? (
            <p className="status-banner" role="status">
              Checking your email change link...
            </p>
          ) : null}

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
      <p className="page-description">
        Use the verification link from the new email address to finish updating your account.
      </p>
    </AuthPageShell>
  );
}
