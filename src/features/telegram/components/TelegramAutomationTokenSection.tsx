import type { TelegramAutomationTokenSummary } from '../model';

interface TelegramAutomationTokenSectionProps {
  automationToken: TelegramAutomationTokenSummary;
  rawToken: string;
  actionError: string;
  copyStatus: string;
  isCreating: boolean;
  isRegenerating: boolean;
  isRevoking: boolean;
  onCreate: () => void;
  onRegenerate: () => void;
  onRevoke: () => void;
  onCopy: () => Promise<void>;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function TelegramAutomationTokenSection({
  automationToken,
  rawToken,
  actionError,
  copyStatus,
  isCreating,
  isRegenerating,
  isRevoking,
  onCreate,
  onRegenerate,
  onRevoke,
  onCopy,
}: TelegramAutomationTokenSectionProps) {
  return (
    <section className="page-card stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Automation token</h2>
          <p className="page-description">
            Use one personal token for iOS Shortcuts and rotate it when needed.
          </p>
        </div>
      </div>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <dl className="detail-grid">
        <div className="detail-item">
          <dt>Status</dt>
          <dd>{automationToken.present ? 'Present' : 'Missing'}</dd>
        </div>
        <div className="detail-item">
          <dt>Token hint</dt>
          <dd>{automationToken.tokenHint ?? 'No active token'}</dd>
        </div>
        <div className="detail-item">
          <dt>Created</dt>
          <dd>{formatDateTime(automationToken.createdAt)}</dd>
        </div>
        <div className="detail-item">
          <dt>Last used</dt>
          <dd>{formatDateTime(automationToken.lastUsedAt)}</dd>
        </div>
      </dl>

      <div className="inline-actions">
        {!automationToken.present ? (
          <button className="button button-primary form-action-button" disabled={isCreating} onClick={onCreate} type="button">
            {isCreating ? 'Creating token…' : 'Create token'}
          </button>
        ) : null}

        {automationToken.present ? (
          <>
            <button
              className="button button-primary form-action-button"
              disabled={isRegenerating}
              onClick={onRegenerate}
              type="button"
            >
              {isRegenerating ? 'Regenerating token…' : 'Regenerate token'}
            </button>
            <button
              className="button button-secondary button-danger form-action-button"
              disabled={isRevoking}
              onClick={onRevoke}
              type="button"
            >
              {isRevoking ? 'Revoking token…' : 'Revoke token'}
            </button>
          </>
        ) : null}
      </div>

      {rawToken ? (
        <div className="stack telegram-raw-token">
          <label className="field">
            <span>Raw token</span>
            <input readOnly value={rawToken} />
          </label>
          <p className="page-description">
            This value is shown once after creation or regeneration.
          </p>
          <div className="inline-actions">
            <button
              className="button button-secondary form-action-button"
              onClick={() => {
                void onCopy();
              }}
              type="button"
            >
              Copy token
            </button>
            {copyStatus ? (
              <p className="status-banner status-success" role="status">
                {copyStatus}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
