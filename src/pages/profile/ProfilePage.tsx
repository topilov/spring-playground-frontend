import { useState } from 'react';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

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
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">My Profile</p>
          <h1>Loading your session</h1>
          <p className="section-copy">
            Checking the current `JSESSIONID`-backed session with the backend.
          </p>
        </article>
      </section>
    );
  }

  if (status === 'anonymous') {
    return (
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">My Profile</p>
          <h1>You are not signed in</h1>
          <p className="section-copy">
            This page uses `GET /api/profile/me`, so it needs an authenticated
            session cookie first.
          </p>
          <AppLink className="primary-button link-button" to={routePaths.login}>
            Go to login
          </AppLink>
        </article>
      </section>
    );
  }

  if (status === 'error' || !profile) {
    return (
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">My Profile</p>
          <h1>Profile unavailable</h1>
          <p className="status-message status-error" role="alert">
            {refreshError || errorMessage || 'We could not load your profile.'}
          </p>
          <button
            className="secondary-button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            type="button"
          >
            {isRefreshing ? 'Refreshing...' : 'Try again'}
          </button>
        </article>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <article className="form-card">
        <div className="profile-header">
          <div>
            <p className="eyebrow">My Profile</p>
            <h1>{profile.displayName}</h1>
            <p className="section-copy">
              Signed in as {profile.username} with role {profile.role}.
            </p>
          </div>
          <button
            className="secondary-button"
            disabled={isRefreshing}
            onClick={handleRefresh}
            type="button"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {refreshError ? (
          <p className="status-message status-error" role="alert">
            {refreshError}
          </p>
        ) : null}

        <dl className="profile-grid">
          <div className="profile-item">
            <dt>Username</dt>
            <dd>{profile.username}</dd>
          </div>
          <div className="profile-item">
            <dt>Email</dt>
            <dd>{profile.email}</dd>
          </div>
          <div className="profile-item">
            <dt>User ID</dt>
            <dd>{profile.userId}</dd>
          </div>
          <div className="profile-item">
            <dt>Profile ID</dt>
            <dd>{profile.id}</dd>
          </div>
          <div className="profile-item profile-item-wide">
            <dt>Bio</dt>
            <dd>{profile.bio || 'No bio set yet.'}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
