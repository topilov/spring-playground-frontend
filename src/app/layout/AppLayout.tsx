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

  return (
    <div className="app-shell">
      <header className="app-header">
        <AppLink className="brand" to={routePaths.home}>
          <span aria-hidden="true" className="brand-mark">
            SP
          </span>
          <span className="brand-name">Spring Playground</span>
        </AppLink>

        <nav aria-label="Primary" className="header-actions">
          {status === 'loading' ? (
            <span className="header-meta">Checking session</span>
          ) : null}

          {isAuthenticated ? (
            <>
              <span className="header-meta">{profile?.username ?? 'Account'}</span>
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
              <button
                className="button button-secondary"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                type="button"
              >
                {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
              </button>
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
