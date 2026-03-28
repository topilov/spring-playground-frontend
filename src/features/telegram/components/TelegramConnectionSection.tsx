import type { TelegramConnectionState } from '../model';

interface TelegramConnectionSectionProps {
  connectionState: TelegramConnectionState;
  phoneNumber: string;
  code: string;
  password: string;
  actionError: string;
  isStarting: boolean;
  isConfirmingCode: boolean;
  isConfirmingPassword: boolean;
  isDisconnecting: boolean;
  onPhoneNumberChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onStart: (event: React.FormEvent<HTMLFormElement>) => void;
  onConfirmCode: (event: React.FormEvent<HTMLFormElement>) => void;
  onConfirmPassword: (event: React.FormEvent<HTMLFormElement>) => void;
  onDisconnect: () => void;
}

export function TelegramConnectionSection({
  connectionState,
  phoneNumber,
  code,
  password,
  actionError,
  isStarting,
  isConfirmingCode,
  isConfirmingPassword,
  isDisconnecting,
  onPhoneNumberChange,
  onCodeChange,
  onPasswordChange,
  onStart,
  onConfirmCode,
  onConfirmPassword,
  onDisconnect,
}: TelegramConnectionSectionProps) {
  const telegramUser =
    connectionState.connected && connectionState.telegramUser
      ? connectionState.telegramUser
      : null;
  const nextStep = connectionState.pendingAuth?.nextStep ?? null;

  return (
    <section className="page-card stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Connection</h2>
          <p className="page-description">
            Connect one Telegram account and keep the sign-in flow aligned with the backend.
          </p>
        </div>
      </div>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {telegramUser ? (
        <div className="stack">
          <dl className="detail-grid">
            <div className="detail-item">
              <dt>Display name</dt>
              <dd>{telegramUser.displayName}</dd>
            </div>
            <div className="detail-item">
              <dt>Phone number</dt>
              <dd>{telegramUser.phoneNumber}</dd>
            </div>
            <div className="detail-item">
              <dt>Username</dt>
              <dd>{telegramUser.username ?? 'Not set'}</dd>
            </div>
            <div className="detail-item">
              <dt>Premium</dt>
              <dd>{telegramUser.premium ? 'Available' : 'Unavailable'}</dd>
            </div>
          </dl>

          <div className="inline-actions">
            <button
              className="button button-secondary button-danger form-action-button"
              disabled={isDisconnecting}
              onClick={onDisconnect}
              type="button"
            >
              {isDisconnecting ? 'Disconnecting…' : 'Disconnect Telegram'}
            </button>
          </div>
        </div>
      ) : null}

      {!telegramUser && nextStep === null ? (
        <form className="stack" onSubmit={onStart}>
          <label className="field">
            <span>Phone number</span>
            <input
              autoComplete="tel"
              onChange={(event) => onPhoneNumberChange(event.target.value)}
              placeholder="+15551234567"
              spellCheck={false}
              value={phoneNumber}
            />
          </label>

          <div className="inline-actions">
            <button className="button button-primary form-action-button" disabled={isStarting} type="submit">
              {isStarting ? 'Starting connection…' : 'Connect Telegram'}
            </button>
          </div>
        </form>
      ) : null}

      {!telegramUser && nextStep === 'CODE' ? (
        <form className="stack" onSubmit={onConfirmCode}>
          <label className="field">
            <span>Login code</span>
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              onChange={(event) => onCodeChange(event.target.value)}
              placeholder="12345"
              spellCheck={false}
              value={code}
            />
          </label>

          <div className="inline-actions">
            <button
              className="button button-primary form-action-button"
              disabled={isConfirmingCode}
              type="submit"
            >
              {isConfirmingCode ? 'Confirming code…' : 'Confirm code'}
            </button>
          </div>
        </form>
      ) : null}

      {!telegramUser && nextStep === 'PASSWORD' ? (
        <form className="stack" onSubmit={onConfirmPassword}>
          <label className="field">
            <span>Telegram password</span>
            <input
              autoComplete="current-password"
              onChange={(event) => onPasswordChange(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          <div className="inline-actions">
            <button
              className="button button-primary form-action-button"
              disabled={isConfirmingPassword}
              type="submit"
            >
              {isConfirmingPassword ? 'Confirming password…' : 'Confirm password'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
