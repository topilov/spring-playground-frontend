import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../../features/auth/mutations';
import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

function getHeaderLinkClassName(isActive: boolean) {
  return isActive ? 'header-link header-link-active' : 'header-link';
}

export function AppLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, status } = useAuthSession();
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

  const sessionContext =
    status === 'loading'
      ? 'Checking session'
      : isAuthenticated && profile
        ? `Signed in as ${profile.displayName}`
        : null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <AppLink className="brand" to={routePaths.home}>
          <span aria-hidden="true" className="brand-mark">
            SP
          </span>
          <span className="brand-name">Spring Playground</span>
        </AppLink>

        {sessionContext ? (
          <p aria-label="Session context" className="header-meta" role="status">
            {sessionContext}
          </p>
        ) : (
          <div className="header-meta-spacer" aria-hidden="true" />
        )}

        <div className="header-actions">
          <nav aria-label="Primary" className="inline-actions">
            {isAuthenticated ? (
              <>
                <NavLink
                  className={({ isActive }) => getHeaderLinkClassName(isActive)}
                  to={routePaths.profile}
                >
                  Profile
                </NavLink>
                <NavLink
                  className={({ isActive }) => getHeaderLinkClassName(isActive)}
                  to={routePaths.settingsSecurity}
                >
                  Settings
                </NavLink>
              </>
            ) : null}

            {!isAuthenticated && status !== 'loading' ? (
              <NavLink
                className={({ isActive }) => getHeaderLinkClassName(isActive)}
                to={routePaths.login}
              >
                Sign in
              </NavLink>
            ) : null}
          </nav>

          <nav aria-label="Utility" className="inline-actions">
            {!isAuthenticated && status !== 'loading' ? (
              <NavLink
                className={({ isActive }) => getHeaderLinkClassName(isActive)}
                to={routePaths.register}
              >
                Create account
              </NavLink>
            ) : null}

            {isAuthenticated ? (
              <button
                className="button button-secondary"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                type="button"
              >
                {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
              </button>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {logoutError ? (
          <p className="status-banner status-error" role="alert">
            {logoutError}
          </p>
        ) : null}

        <Outlet />
      </main>
    </div>
  );
}
