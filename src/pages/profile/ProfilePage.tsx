import { useState } from 'react';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';
import { PageHeader } from '../../shared/ui/PageHeader';

export function ProfilePage() {
  const { errorMessage, profile, refreshSession, status } = useAuthSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError('');

    try {
      await refreshSession();
    } catch (error) {
      setRefreshError(
        getApiErrorMessage(error, 'We could not refresh your profile.')
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  if (status === 'loading') {
    return (
      <AuthPageShell
        subtitle="Load the current operator profile before editing account details."
        utility={
          <p className="status-banner" role="status">
            Pulling the latest account record from the active session.
          </p>
        }
        title="Profile"
      />
    );
  }

  if (status === 'anonymous') {
    return (
      <AuthPageShell
        subtitle="Protected account details stay behind operator sign-in."
        utility={
          <p className="status-banner" role="status">
            Return to sign in, then reopen the profile workspace from the active session.
          </p>
        }
        title="Profile"
      >
        <AppLink className="button button-primary button-full" to={routePaths.login}>
          Sign in
        </AppLink>
      </AuthPageShell>
    );
  }

  if (status === 'error' || !profile) {
    return (
      <AuthPageShell
        subtitle="The operator record is unavailable right now."
        utility={
          <p className="status-banner status-error" role="alert">
            {refreshError || errorMessage || 'We could not load your profile.'}
          </p>
        }
        title="Profile"
      >
        <button
          className="button button-secondary button-full"
          disabled={isRefreshing}
          onClick={handleRefresh}
          type="button"
        >
          {isRefreshing ? 'Refreshing...' : 'Try again'}
        </button>
      </AuthPageShell>
    );
  }

  return (
    <section className="page-grid">
      <PageHeader
        actions={
          <div className="inline-actions">
            <AppLink className="button button-secondary" to={routePaths.settingsAccount}>
              Account
            </AppLink>
            <button
              className="button button-secondary"
              disabled={isRefreshing}
              onClick={handleRefresh}
              type="button"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        }
        description="Reference view for the signed-in identity and account record."
        eyebrow="Overview"
        status={
          refreshError ? (
            <p className="status-banner status-error" role="alert">
              {refreshError}
            </p>
          ) : (
            <p className="status-banner" role="status">
              Session-backed profile details refresh on demand.
            </p>
          )
        }
        title="Profile"
      />

      <div className="workspace-shell workspace-shell-split">
        <section className="workspace-band workspace-band-primary stack">
          <div className="workspace-band-header">
            <div className="section-heading">
              <h2>Identity snapshot</h2>
              <p className="page-description">
                Reference details for the current session, support follow-up, and account edits.
              </p>
            </div>
            <p className="workspace-note">
              Signed in as <strong>{profile.displayName}</strong>
            </p>
          </div>

          <dl className="detail-rows">
            <div className="detail-row">
              <dt>Display name</dt>
              <dd>{profile.displayName}</dd>
            </div>
            <div className="detail-row">
              <dt>Username</dt>
              <dd>{profile.username}</dd>
            </div>
            <div className="detail-row">
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="detail-row">
              <dt>Role</dt>
              <dd>{profile.role}</dd>
            </div>
          </dl>
        </section>

        <aside className="workspace-column stack">
          <section className="workspace-band stack">
            <div className="section-heading">
              <h2>Account records</h2>
              <p className="page-description">
                Stable identifiers and profile notes kept separate from editable account fields.
              </p>
            </div>

            <dl className="detail-rows">
              <div className="detail-row">
                <dt>User ID</dt>
                <dd>{profile.userId}</dd>
              </div>
              <div className="detail-row">
                <dt>Profile ID</dt>
                <dd>{profile.id}</dd>
              </div>
              <div className="detail-row detail-row-wide">
                <dt>Bio</dt>
                <dd>{profile.bio || 'No bio added.'}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
