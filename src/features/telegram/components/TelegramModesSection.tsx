import { useState } from 'react';

import type { TelegramMode } from '../model';

interface TelegramModesSectionProps {
  actionError: string;
  initialModes: TelegramMode[];
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  onCreate: (values: { mode: string; emojiStatusDocumentId: string }) => Promise<void>;
  onDelete: (mode: string) => Promise<void>;
  onUpdate: (values: {
    mode: string;
    newMode: string;
    emojiStatusDocumentId: string;
  }) => Promise<void>;
}

interface TelegramModeDraft {
  mode: string;
  emojiStatusDocumentId: string;
}

function createModeDrafts(modes: TelegramMode[]): Record<string, TelegramModeDraft> {
  return Object.fromEntries(
    modes.map((entry) => [
      entry.mode,
      {
        mode: entry.mode,
        emojiStatusDocumentId: entry.emojiStatusDocumentId,
      },
    ])
  );
}

export function TelegramModesSection({
  actionError,
  initialModes,
  isCreating,
  isDeleting,
  isUpdating,
  onCreate,
  onDelete,
  onUpdate,
}: TelegramModesSectionProps) {
  const [newMode, setNewMode] = useState('');
  const [newEmojiStatusDocumentId, setNewEmojiStatusDocumentId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, TelegramModeDraft>>(
    createModeDrafts(initialModes)
  );
  const isBusy = isCreating || isDeleting || isUpdating;

  return (
    <section className="workspace-band stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Telegram modes</h2>
          <p className="page-description">
            Create and maintain the user-defined modes that iOS Shortcuts can turn on and off.
          </p>
        </div>
      </div>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <form
        className="telegram-mode-form"
        onSubmit={async (event) => {
          event.preventDefault();
          await onCreate({
            mode: newMode,
            emojiStatusDocumentId: newEmojiStatusDocumentId,
          });
          setNewMode('');
          setNewEmojiStatusDocumentId('');
        }}
      >
        <label className="field">
          <span>New mode name</span>
          <input
            onChange={(event) => setNewMode(event.target.value)}
            placeholder="work"
            value={newMode}
          />
        </label>

        <label className="field">
          <span>New mode emoji status</span>
          <input
            onChange={(event) => setNewEmojiStatusDocumentId(event.target.value)}
            placeholder="1001"
            value={newEmojiStatusDocumentId}
          />
        </label>

        <div className="inline-actions">
          <button className="button button-primary" disabled={isBusy} type="submit">
            {isCreating ? 'Adding mode...' : 'Add mode'}
          </button>
        </div>
      </form>

      {initialModes.length > 0 ? (
        <div className="telegram-mode-list">
          {initialModes.map((entry) => {
            const draft = drafts[entry.mode] ?? {
              mode: entry.mode,
              emojiStatusDocumentId: entry.emojiStatusDocumentId,
            };

            return (
              <form
                className="telegram-mode-card stack"
                key={entry.mode}
                onSubmit={async (event) => {
                  event.preventDefault();
                  await onUpdate({
                    mode: entry.mode,
                    newMode: draft.mode,
                    emojiStatusDocumentId: draft.emojiStatusDocumentId,
                  });
                }}
              >
                <label className="field">
                  <span>{`Mode name for ${entry.mode}`}</span>
                  <input
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [entry.mode]: {
                          ...draft,
                          mode: event.target.value,
                        },
                      }))
                    }
                    value={draft.mode}
                  />
                </label>

                <label className="field">
                  <span>{`Emoji status for ${entry.mode}`}</span>
                  <input
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [entry.mode]: {
                          ...draft,
                          emojiStatusDocumentId: event.target.value,
                        },
                      }))
                    }
                    value={draft.emojiStatusDocumentId}
                  />
                </label>

                <div className="inline-actions">
                  <button className="button button-primary" disabled={isBusy} type="submit">
                    {isUpdating ? `Saving mode ${entry.mode}...` : `Save mode ${entry.mode}`}
                  </button>
                  <button
                    className="button"
                    disabled={isBusy}
                    onClick={() => onDelete(entry.mode)}
                    type="button"
                  >
                    {isDeleting ? `Deleting mode ${entry.mode}...` : `Delete mode ${entry.mode}`}
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      ) : (
        <p className="page-description">
          No Telegram modes yet. Add one to let your automation token activate it.
        </p>
      )}
    </section>
  );
}
