import { useState } from 'react';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import {
  useDeletePasskeyMutation,
  usePasskeysQuery,
  useRegisterPasskeyMutation,
  useRenamePasskeyMutation,
} from '../hooks';

function formatDeviceHint(value: string | null) {
  if (!value) {
    return 'Unknown';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Never used yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function PasskeySection() {
  const passkeysQuery = usePasskeysQuery();
  const registerPasskeyMutation = useRegisterPasskeyMutation();
  const renamePasskeyMutation = useRenamePasskeyMutation();
  const deletePasskeyMutation = useDeletePasskeyMutation();
  const [nickname, setNickname] = useState('');
  const [actionError, setActionError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const passkeys = passkeysQuery.data ?? [];

  const handleAddPasskey = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionError('');

    try {
      await registerPasskeyMutation.mutateAsync({
        nickname: nickname.trim() || undefined,
      });
      setNickname('');
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not add that passkey right now.')
      );
    }
  };

  const handleRenamePasskey = async (id: number) => {
    const nextName = editingName.trim();

    if (!nextName) {
      setActionError('Enter a name for this passkey.');
      return;
    }

    setActionError('');

    try {
      await renamePasskeyMutation.mutateAsync({
        id,
        name: nextName,
      });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not rename that passkey.')
      );
    }
  };

  const handleDeletePasskey = async (id: number) => {
    setActionError('');

    try {
      await deletePasskeyMutation.mutateAsync(id);
      setConfirmDeleteId(null);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'We could not delete that passkey.')
      );
    }
  };

  return (
    <section className="passkey-panel page-card stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Passkeys</h2>
          <p className="page-description">
            Use passkeys for faster sign-in on trusted devices.
          </p>
        </div>
        <p className="workspace-note">
          Add a device, keep the label readable, and retire old credentials when they are no
          longer nearby.
        </p>
      </div>

      <form className="passkey-add-form" onSubmit={handleAddPasskey}>
        <label className="field">
          <span>Passkey name</span>
          <input
            maxLength={100}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Work Laptop"
            value={nickname}
          />
        </label>

        <button
          className="button button-primary form-action-button"
          disabled={registerPasskeyMutation.isPending}
          type="submit"
        >
          {registerPasskeyMutation.isPending ? 'Adding passkey…' : 'Add passkey'}
        </button>
      </form>

      {actionError ? (
        <p className="status-banner status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {passkeysQuery.isLoading ? (
        <div className="passkey-status">
          <p className="page-description">Loading passkeys…</p>
        </div>
      ) : null}

      {passkeysQuery.isError ? (
        <p className="status-banner status-error" role="alert">
          {getApiErrorMessage(
            passkeysQuery.error,
            'We could not load your passkeys.'
          )}
        </p>
      ) : null}

      {!passkeysQuery.isLoading && !passkeysQuery.isError && passkeys.length === 0 ? (
        <article className="passkey-empty-state">
          <h3>No passkeys yet.</h3>
          <p className="page-description">
            Register a passkey to keep sign-in faster on a device you already trust.
          </p>
        </article>
      ) : null}

      {!passkeysQuery.isLoading && passkeys.length > 0 ? (
        <ul className="passkey-list">
          {passkeys.map((passkey) => {
            const isEditing = editingId === passkey.id;
            const isDeleting = confirmDeleteId === passkey.id;

            return (
              <li className="passkey-entry" key={passkey.id}>
                <div className="passkey-card-header">
                  <div className="stack">
                    <h3>{passkey.name}</h3>
                    <p className="page-description">
                      Device: {formatDeviceHint(passkey.deviceHint)}
                    </p>
                  </div>

                  <div className="inline-actions">
                    <button
                      aria-label={`Rename ${passkey.name}`}
                      className="button button-secondary form-action-button"
                      onClick={() => {
                        setEditingId(passkey.id);
                        setEditingName(passkey.name);
                        setConfirmDeleteId(null);
                      }}
                      type="button"
                    >
                      Rename
                    </button>
                    <button
                      aria-label={`Delete ${passkey.name}`}
                      className="button button-secondary button-danger form-action-button"
                      onClick={() => {
                        setConfirmDeleteId(passkey.id);
                        setEditingId(null);
                      }}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <dl className="passkey-meta-grid">
                  <div className="detail-item">
                    <dt>Created</dt>
                    <dd>{formatDateTime(passkey.createdAt)}</dd>
                  </div>
                  <div className="detail-item">
                    <dt>Last used</dt>
                    <dd>{formatDateTime(passkey.lastUsedAt)}</dd>
                  </div>
                  <div className="detail-item detail-item-wide">
                    <dt>Transports</dt>
                    <dd>
                      {passkey.transports.length > 0
                        ? passkey.transports.join(', ')
                        : 'Not reported'}
                    </dd>
                  </div>
                </dl>

                {isEditing ? (
                  <div className="passkey-inline-form">
                    <label className="field">
                      <span>New name</span>
                      <input
                        maxLength={100}
                        onChange={(event) => setEditingName(event.target.value)}
                        value={editingName}
                      />
                    </label>
                    <div className="inline-actions">
                      <button
                        className="button button-primary form-action-button"
                        disabled={renamePasskeyMutation.isPending}
                        onClick={() => handleRenamePasskey(passkey.id)}
                        type="button"
                      >
                        Save
                      </button>
                      <button
                        className="button button-secondary form-action-button"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName('');
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}

                {isDeleting ? (
                  <div className="passkey-inline-form">
                    <p className="page-description">
                      This passkey will no longer work for this account.
                    </p>
                    <div className="inline-actions">
                      <button
                        className="button button-danger form-action-button"
                        disabled={deletePasskeyMutation.isPending}
                        onClick={() => handleDeletePasskey(passkey.id)}
                        type="button"
                      >
                        Delete passkey
                      </button>
                      <button
                        className="button button-secondary form-action-button"
                        onClick={() => setConfirmDeleteId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
