import type { TelegramSettings } from '../model';

interface TelegramCurrentStateSectionProps {
  settings: TelegramSettings;
}

function getAppliedEmojiStatusDocumentId(settings: TelegramSettings): string | null {
  if (settings.activeFocusMode) {
    return (
      settings.modes.find((entry) => entry.mode === settings.activeFocusMode)
        ?.emojiStatusDocumentId ?? null
    );
  }

  return settings.defaultEmojiStatusDocumentId;
}

export function TelegramCurrentStateSection({
  settings,
}: TelegramCurrentStateSectionProps) {
  const appliedEmojiStatusDocumentId = getAppliedEmojiStatusDocumentId(settings);

  return (
    <section className="workspace-band stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Current state</h2>
          <p className="page-description">
            View the current backend-owned Telegram connection and mode-sync state.
          </p>
        </div>
      </div>

      {!settings.telegramUser?.premium && settings.connected ? (
        <p className="status-banner status-error" role="alert">
          Telegram Premium is required for emoji status sync.
        </p>
      ) : null}

      <dl className="detail-grid">
        <div className="detail-item">
          <dt>Active mode</dt>
          <dd>{settings.activeFocusMode ?? 'No active mode'}</dd>
        </div>
        <div className="detail-item">
          <dt>Applied emoji status</dt>
          <dd>{appliedEmojiStatusDocumentId ?? 'Cleared'}</dd>
        </div>
        <div className="detail-item">
          <dt>Stored modes</dt>
          <dd>
            {settings.modes.length > 0
              ? settings.modes.map((entry) => entry.mode).join(', ')
              : 'No stored modes'}
          </dd>
        </div>
        <div className="detail-item">
          <dt>Telegram Premium</dt>
          <dd>
            {settings.connected
              ? settings.telegramUser?.premium
                ? 'Available'
                : 'Unavailable'
              : 'Not connected'}
          </dd>
        </div>
      </dl>
    </section>
  );
}
