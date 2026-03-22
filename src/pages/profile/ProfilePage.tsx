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
        subtitle="Loading your account details."
        title="Profile"
      />
    );
  }

  if (status === 'anonymous') {
    return (
      <AuthPageShell
        subtitle="Sign in to view your profile."
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
        subtitle="We could not load your account details."
        title="Profile"
      >
        <p className="status-banner status-error" role="alert">
          {refreshError || errorMessage || 'We could not load your profile.'}
        </p>
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
            <AppLink className="button button-secondary" to={routePaths.settingsSecurity}>
              Security
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
        description={profile.displayName}
        eyebrow="Account"
        title="Profile"
      />

      {refreshError ? (
        <p className="status-banner status-error" role="alert">
          {refreshError}
        </p>
      ) : null}

      <article className="page-card stack">
        <div className="section-heading">
          <h2>Identity</h2>
        </div>

        <dl className="detail-grid">
          <div className="detail-item">
            <dt>Display name</dt>
            <dd>{profile.displayName}</dd>
          </div>
          <div className="detail-item">
            <dt>Username</dt>
            <dd>{profile.username}</dd>
          </div>
          <div className="detail-item">
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="detail-item">
            <dt>Role</dt>
            <dd>{profile.role}</dd>
          </div>
        </dl>
      </article>

      <article className="page-card stack">
        <div className="section-heading">
          <h2>Details</h2>
        </div>

        <dl className="detail-grid">
          <div className="detail-item">
            <dt>User ID</dt>
            <dd>{profile.userId}</dd>
          </div>
          <div className="detail-item">
            <dt>Profile ID</dt>
            <dd>{profile.id}</dd>
          </div>
          <div className="detail-item detail-item-wide">
            <dt>Bio</dt>
            <dd>{profile.bio || 'No bio added.'}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
