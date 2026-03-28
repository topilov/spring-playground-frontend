import { useState } from 'react';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import {
  useConfirmTwoFactorSetupMutation,
  useDisableTwoFactorMutation,
  useRegenerateBackupCodesMutation,
  useStartTwoFactorSetupMutation,
  useTwoFactorStatusQuery,
} from '../hooks';

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not enabled yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function TwoFactorSection() {
  const statusQuery = useTwoFactorStatusQuery();
  const startSetupMutation = useStartTwoFactorSetupMutation();
  const confirmSetupMutation = useConfirmTwoFactorSetupMutation();
  const regenerateBackupCodesMutation = useRegenerateBackupCodesMutation();
  const disableTwoFactorMutation = useDisableTwoFactorMutation();
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpauthUri: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [actionError, setActionError] = useState('');

  const status = statusQuery.data;
  const isEnabled = Boolean(status?.enabled);

  const handleStartSetup = async () => {
    setActionError('');
    setBackupCodes([]);

    try {
      const result = await startSetupMutation.mutateAsync();
      setSetupData(result);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not start two-factor setup right now.')
      );
    }
  };

  const handleConfirmSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!verificationCode.trim()) {
      setActionError('Enter the six-digit code from your authenticator app.');
      return;
    }

    setActionError('');

    try {
      const result = await confirmSetupMutation.mutateAsync({
        code: verificationCode,
      });
      setVerificationCode('');
      setBackupCodes(result.backupCodes);
      setSetupData(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not confirm that verification code.')
      );
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setActionError('');

    try {
      const result = await regenerateBackupCodesMutation.mutateAsync();
      setBackupCodes(result.backupCodes);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not regenerate backup codes.')
      );
    }
  };

  const handleDisableTwoFactor = async () => {
    setActionError('');

    try {
      await disableTwoFactorMutation.mutateAsync();
      setSetupData(null);
      setBackupCodes([]);
      setVerificationCode('');
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not disable two-factor authentication.')
      );
    }
  };

  return (
    <section className="two-factor-panel page-card stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Two-factor authentication</h2>
          <p className="page-description">
            Add TOTP verification for password sign-in and keep a recovery path with backup
            codes.
          </p>
        </div>

        <p className="workspace-note">
          Setup stays pending until a valid authenticator code is confirmed. Backup codes are
          shown only when they are freshly issued.
        </p>
      </div>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {statusQuery.isLoading ? (
        <div className="passkey-status">
          <p className="page-description">Loading two-factor status…</p>
        </div>
      ) : null}

      {statusQuery.isError ? (
        <p className="status-banner status-error" role="alert">
          {getApiErrorMessage(
            statusQuery.error,
            'We could not load your two-factor settings.'
          )}
        </p>
      ) : null}

      {!statusQuery.isLoading && !statusQuery.isError && status ? (
        <dl className="detail-grid">
          <div className="detail-item">
            <dt>Status</dt>
            <dd>{isEnabled ? 'Enabled' : status.pendingSetup ? 'Pending setup' : 'Not enabled'}</dd>
          </div>
          <div className="detail-item">
            <dt>Backup codes remaining</dt>
            <dd>{status.backupCodesRemaining}</dd>
          </div>
          <div className="detail-item detail-item-wide">
            <dt>Enabled at</dt>
            <dd>{formatDateTime(status.enabledAt)}</dd>
          </div>
        </dl>
      ) : null}

      {!statusQuery.isLoading && !statusQuery.isError && !isEnabled ? (
        <div className="stack">
          <p className="page-description">
            {status?.pendingSetup
              ? 'A setup attempt is already pending. Start again to issue a fresh authenticator secret.'
              : 'Enable TOTP to require an authenticator code after password sign-in.'}
          </p>
          <div className="inline-actions">
            <button
              className="button button-primary form-action-button"
              disabled={startSetupMutation.isPending}
              onClick={handleStartSetup}
              type="button"
            >
              {startSetupMutation.isPending ? 'Starting setup…' : 'Start setup'}
            </button>
          </div>
        </div>
      ) : null}

      {setupData ? (
        <section className="passkey-entry stack">
          <div className="section-heading">
            <h3>Authenticator setup</h3>
            <p className="page-description">
              Use the setup key or the `otpauth` URI with your authenticator app, then confirm
              with a fresh six-digit code.
            </p>
          </div>

          <div className="two-factor-setup-grid">
            <label className="field">
              <span>Setup key</span>
              <input readOnly value={setupData.secret} />
            </label>

            <label className="field">
              <span>Authenticator URI</span>
              <textarea readOnly rows={3} value={setupData.otpauthUri} />
            </label>
          </div>

          <form className="passkey-inline-form" onSubmit={handleConfirmSetup}>
            <label className="field">
              <span>Verification code</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="123456"
                value={verificationCode}
              />
            </label>

            <div className="inline-actions">
              <button
                className="button button-primary form-action-button"
                disabled={confirmSetupMutation.isPending}
                type="submit"
              >
                {confirmSetupMutation.isPending
                  ? 'Enabling two-factor authentication…'
                  : 'Enable two-factor authentication'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {isEnabled ? (
        <div className="inline-actions">
          <button
            className="button button-secondary form-action-button"
            disabled={regenerateBackupCodesMutation.isPending}
            onClick={handleRegenerateBackupCodes}
            type="button"
          >
            {regenerateBackupCodesMutation.isPending
              ? 'Regenerating backup codes…'
              : 'Regenerate backup codes'}
          </button>
          <button
            className="button button-secondary button-danger form-action-button"
            disabled={disableTwoFactorMutation.isPending}
            onClick={handleDisableTwoFactor}
            type="button"
          >
            {disableTwoFactorMutation.isPending
              ? 'Disabling two-factor authentication…'
              : 'Disable two-factor authentication'}
          </button>
        </div>
      ) : null}

      {backupCodes.length > 0 ? (
        <section className="passkey-entry stack">
          <div className="section-heading">
            <h3>Backup codes</h3>
            <p className="page-description">
              Store these one-time recovery codes somewhere safe. The backend will not show the
              same plaintext codes again.
            </p>
          </div>

          <ul className="backup-code-list">
            {backupCodes.map((backupCode) => (
              <li className="backup-code-item" key={backupCode}>
                {backupCode}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
