import { useState } from 'react';

interface TelegramFocusSettingsSectionProps {
  initialDefaultEmojiStatusDocumentId: string;
  actionError: string;
  isSaving: boolean;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    values: {
      defaultEmojiStatusDocumentId: string;
    }
  ) => void;
}

export function TelegramFocusSettingsSection({
  initialDefaultEmojiStatusDocumentId,
  actionError,
  isSaving,
  onSubmit,
}: TelegramFocusSettingsSectionProps) {
  const [defaultEmojiStatusDocumentId, setDefaultEmojiStatusDocumentId] = useState(
    initialDefaultEmojiStatusDocumentId
  );

  return (
    <section className="page-card stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Default status</h2>
          <p className="page-description">
            Set the emoji status the backend should apply when no Telegram mode is active.
          </p>
        </div>
      </div>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <form
        className="stack"
        onSubmit={(event) =>
          onSubmit(event, {
            defaultEmojiStatusDocumentId,
          })
        }
      >
        <label className="field">
          <span>No focus emoji status</span>
          <input
            onChange={(event) => setDefaultEmojiStatusDocumentId(event.target.value)}
            placeholder="7000"
            spellCheck={false}
            value={defaultEmojiStatusDocumentId}
          />
        </label>

        <div className="inline-actions">
          <button className="button button-primary form-action-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving default status…' : 'Save default status'}
          </button>
        </div>
      </form>
    </section>
  );
}
