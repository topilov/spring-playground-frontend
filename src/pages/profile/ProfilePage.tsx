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
          {isRefreshing ? 'Refreshing…' : 'Try again'}
        </button>
      </AuthPageShell>
    );
  }

  return (
    <section className="page-grid">
      <PageHeader
        actions={
          <div className="inline-actions">
            <button
              aria-label="Refresh"
              className="button button-secondary button-icon"
              disabled={isRefreshing}
              onClick={handleRefresh}
              type="button"
            >
              <svg aria-hidden="true" className="button-icon-mark" viewBox="0 0 24 24">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15.3-6.36L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15.3 6.36L3 16" />
              </svg>
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
          ) : undefined
        }
        title="Profile"
      />

      <section className="page-card stack">
        <div className="workspace-band-header">
          <div className="section-heading">
            <h2>Account information</h2>
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
    </section>
  );
}
