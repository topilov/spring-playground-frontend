import { useState } from 'react';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { useDeletePasskeyMutation, usePasskeysQuery, useRegisterPasskeyMutation, useRenamePasskeyMutation } from '../hooks';

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
    <section className="stack">
      <div className="stack">
        <h2 className="section-title">Passkeys</h2>
        <p className="section-copy">
          Add a passkey for faster sign-in on supported browsers and devices.
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
          className="primary-button"
          disabled={registerPasskeyMutation.isPending}
          type="submit"
        >
          {registerPasskeyMutation.isPending ? 'Adding passkey...' : 'Add passkey'}
        </button>
      </form>

      {actionError ? (
        <p className="status-message status-error" role="alert">
          {actionError}
        </p>
      ) : null}

      {passkeysQuery.isLoading ? (
        <p className="section-copy">Loading passkeys...</p>
      ) : null}

      {passkeysQuery.isError ? (
        <p className="status-message status-error" role="alert">
          {getApiErrorMessage(
            passkeysQuery.error,
            'We could not load your passkeys.'
          )}
        </p>
      ) : null}

      {!passkeysQuery.isLoading && !passkeysQuery.isError && passkeys.length === 0 ? (
        <article className="passkey-empty-state">
          <p className="section-copy">
            No passkeys added yet. Add one to sign in faster on supported devices.
          </p>
        </article>
      ) : null}

      {!passkeysQuery.isLoading && passkeys.length > 0 ? (
        <ul className="passkey-list">
          {passkeys.map((passkey) => {
            const isEditing = editingId === passkey.id;
            const isDeleting = confirmDeleteId === passkey.id;

            return (
              <li className="passkey-card" key={passkey.id}>
                <div className="passkey-card-header">
                  <div className="stack">
                    <h3>{passkey.name}</h3>
                    <p className="section-copy">
                      {passkey.deviceHint ? `Device: ${passkey.deviceHint}` : 'Device type unavailable'}
                    </p>
                  </div>

                  <div className="action-row">
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setEditingId(passkey.id);
                        setEditingName(passkey.name);
                        setConfirmDeleteId(null);
                      }}
                      type="button"
                    >
                      Rename {passkey.name}
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => {
                        setConfirmDeleteId(passkey.id);
                        setEditingId(null);
                      }}
                      type="button"
                    >
                      Delete {passkey.name}
                    </button>
                  </div>
                </div>

                <dl className="passkey-meta-grid">
                  <div className="profile-item">
                    <dt>Created</dt>
                    <dd>{formatDateTime(passkey.createdAt)}</dd>
                  </div>
                  <div className="profile-item">
                    <dt>Last used</dt>
                    <dd>{formatDateTime(passkey.lastUsedAt)}</dd>
                  </div>
                  <div className="profile-item profile-item-wide">
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
                      <span>New passkey name</span>
                      <input
                        maxLength={100}
                        onChange={(event) => setEditingName(event.target.value)}
                        value={editingName}
                      />
                    </label>
                    <div className="action-row">
                      <button
                        className="primary-button"
                        disabled={renamePasskeyMutation.isPending}
                        onClick={() => handleRenamePasskey(passkey.id)}
                        type="button"
                      >
                        Save name
                      </button>
                      <button
                        className="secondary-button"
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
                    <p className="section-copy">
                      Deleting this passkey removes it from future sign-ins on this account.
                    </p>
                    <div className="action-row">
                      <button
                        className="primary-button"
                        disabled={deletePasskeyMutation.isPending}
                        onClick={() => handleDeletePasskey(passkey.id)}
                        type="button"
                      >
                        Confirm delete
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setConfirmDeleteId(null)}
                        type="button"
                      >
                        Keep passkey
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
