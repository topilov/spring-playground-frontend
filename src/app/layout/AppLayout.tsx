import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../../features/auth/mutations';
import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { routePaths } from '../../shared/routing/paths';

function getNavLinkClassName(isActive: boolean) {
  return isActive ? 'nav-link nav-link-active' : 'nav-link';
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
    <main className="page-shell">
      <header className="app-toolbar">
        <div className="brand-block">
          <p className="eyebrow">Spring Playground</p>
          <p className="brand-title">Account</p>
        </div>

        <div className="toolbar-status">
          {status === 'authenticated' && profile
            ? `Signed in as ${profile.username}`
            : status === 'loading'
              ? 'Checking session...'
              : status === 'error'
                ? 'Session unavailable'
              : 'Signed out'}
        </div>
      </header>

      <nav className="nav-bar" aria-label="Primary">
        <NavLink
          className={({ isActive }) => getNavLinkClassName(isActive)}
          to={routePaths.home}
        >
          Home
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink
              className={({ isActive }) => getNavLinkClassName(isActive)}
              to={routePaths.profile}
            >
              Profile
            </NavLink>
            <NavLink
              className={({ isActive }) => getNavLinkClassName(isActive)}
              to={routePaths.settingsSecurity}
            >
              Security
            </NavLink>
          </>
        ) : null}

        {!isAuthenticated && status !== 'loading' ? (
          <>
            <NavLink
              className={({ isActive }) => getNavLinkClassName(isActive)}
              to={routePaths.login}
            >
              Login
            </NavLink>
            <NavLink
              className={({ isActive }) => getNavLinkClassName(isActive)}
              to={routePaths.register}
            >
              Register
            </NavLink>
          </>
        ) : null}

        {isAuthenticated ? (
          <button
            className="nav-button"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
            type="button"
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
        ) : null}
      </nav>

      {logoutError ? (
        <p className="status-message status-error" role="alert">
          {logoutError}
        </p>
      ) : null}

      <Outlet />
    </main>
  );
}
