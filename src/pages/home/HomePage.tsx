import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../../features/auth/mutations';
import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { usePublicPing } from '../../features/public/usePublicPing';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

export function HomePage() {
  const navigate = useNavigate();
  const { errorMessage, profile, status } = useAuthSession();
  const pingQuery = usePublicPing();
  const logoutMutation = useLogoutMutation();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');

    try {
      await logoutMutation.mutateAsync();
      navigate(routePaths.login);
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, 'We could not log you out.'));
    }
  };

  if (status === 'authenticated' && profile) {
    return (
      <section className="home-layout">
        <section className="hero hero-home split-hero">
          <div className="hero-copy-block">
            <p className="eyebrow">Home</p>
            <h1>Welcome back.</h1>
            <p className="hero-copy">
              Your account is active and ready. Review your profile or continue
              from your personal workspace.
            </p>
            <div className="action-row action-row-tight">
              <AppLink className="primary-button link-button" to={routePaths.profile}>
                Open profile
              </AppLink>
              <button
                className="secondary-button"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                type="button"
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </section>

        <article className="summary-card summary-card-strong">
          <div className="summary-header">
            <div>
              <p className="summary-label">Profile</p>
              <h1>{profile.displayName}</h1>
            </div>
            <span className="role-pill">{profile.role}</span>
          </div>

          <dl className="summary-grid">
            <div className="summary-item">
              <dt>Email</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="summary-item">
              <dt>Username</dt>
              <dd>{profile.username}</dd>
            </div>
            <div className="summary-item summary-item-wide">
              <dt>Bio</dt>
              <dd>{profile.bio || 'No bio added yet.'}</dd>
            </div>
          </dl>

          {logoutError ? (
            <p className="status-message status-error" role="alert">
              {logoutError}
            </p>
          ) : null}

          <p className="status-inline">
            {pingQuery.isPending
              ? 'Checking backend reachability...'
              : pingQuery.isError
                ? 'Backend reachability check failed.'
                : `Backend status: ${pingQuery.data.status}`}
          </p>
        </article>
      </section>
    );
  }

  return (
    <section className="home-layout">
      <section className="hero hero-home split-hero">
        <div className="hero-copy-block">
          <p className="eyebrow">Home</p>
          <h1>Simple access to your account.</h1>
          <p className="hero-copy">
            Sign in to view your profile, recover access when needed, and keep
            your account details in one clean workspace.
          </p>
          <div className="action-row action-row-tight">
            <AppLink className="primary-button link-button" to={routePaths.login}>
              Login
            </AppLink>
            <AppLink className="secondary-button link-button" to={routePaths.register}>
              Create account
            </AppLink>
          </div>
          <p className="helper-links">
            Forgot your password?{' '}
            <AppLink to={routePaths.forgotPassword}>Reset it here</AppLink>
          </p>
        </div>
      </section>

      <section className="summary-card summary-card-strong">
        <p className="summary-label">What you can do</p>
        <h2 className="section-title">A minimal account workspace</h2>
        <p className="section-copy">
          Create an account, sign in, recover access if needed, and review your
          current profile without extra dashboard clutter.
        </p>

        {status === 'error' && errorMessage ? (
          <p className="status-message status-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <dl className="summary-grid">
          <div className="summary-item">
            <dt>Backend</dt>
            <dd>
              {pingQuery.isPending
                ? 'Checking availability...'
                : pingQuery.isError
                  ? 'Unavailable right now.'
                  : pingQuery.data.status}
            </dd>
          </div>
          <div className="summary-item">
            <dt>Focused</dt>
            <dd>Only the actions you need, no developer-facing noise.</dd>
          </div>
          <div className="summary-item">
            <dt>Private</dt>
            <dd>Protected routes redirect through login when the session is missing.</dd>
          </div>
          <div className="summary-item">
            <dt>Recoverable</dt>
            <dd>Password reset is available directly from the sign-in flow.</dd>
          </div>
        </dl>
      </section>
    </section>
  );
}
