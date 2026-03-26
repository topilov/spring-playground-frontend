import { useState } from 'react';

import { telegramFocusModes, type TelegramFocusMode } from '../model';

interface TelegramFocusSettingsSectionProps {
  initialDefaultEmojiStatusDocumentId: string;
  initialMappings: Record<TelegramFocusMode, string>;
  actionError: string;
  isSaving: boolean;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    values: {
      defaultEmojiStatusDocumentId: string;
      mappings: Record<TelegramFocusMode, string>;
    }
  ) => void;
}

function toFieldLabel(mode: TelegramFocusMode): string {
  switch (mode) {
    case 'do_not_disturb':
      return 'Do not disturb';
    case 'reduce_interruptions':
      return 'Reduce interruptions';
    default:
      return mode.charAt(0).toUpperCase() + mode.slice(1);
  }
}

export function TelegramFocusSettingsSection({
  initialDefaultEmojiStatusDocumentId,
  initialMappings,
  actionError,
  isSaving,
  onSubmit,
}: TelegramFocusSettingsSectionProps) {
  const [defaultEmojiStatusDocumentId, setDefaultEmojiStatusDocumentId] = useState(
    initialDefaultEmojiStatusDocumentId
  );
  const [mappings, setMappings] = useState(initialMappings);

  return (
    <section className="workspace-band stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Focus settings</h2>
          <p className="page-description">
            Keep the no-focus emoji status and each supported focus mapping explicit.
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
            mappings,
          })
        }
      >
        <label className="field">
          <span>No focus emoji status</span>
          <input
            onChange={(event) => setDefaultEmojiStatusDocumentId(event.target.value)}
            placeholder="7000"
            value={defaultEmojiStatusDocumentId}
          />
        </label>

        <div className="telegram-focus-grid">
          {telegramFocusModes.map((mode) => (
            <label className="field" key={mode}>
              <span>{toFieldLabel(mode)}</span>
              <input
                onChange={(event) =>
                  setMappings((current) => ({
                    ...current,
                    [mode]: event.target.value,
                  }))
                }
                placeholder="1001"
                value={mappings[mode]}
              />
            </label>
          ))}
        </div>

        <div className="inline-actions">
          <button className="button button-primary" disabled={isSaving} type="submit">
            {isSaving ? 'Saving focus settings...' : 'Save focus settings'}
          </button>
        </div>
      </form>
    </section>
  );
}
