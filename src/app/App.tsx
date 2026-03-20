import { useState } from 'react';

import { AuthSessionProvider } from '../features/auth/session/AuthSessionProvider';
import { useAuthSession } from '../features/auth/session/useAuthSession';
import { ForgotPasswordPage } from '../pages/forgot-password/ForgotPasswordPage';
import { HomePage } from '../pages/home/HomePage';
import { LoginPage } from '../pages/login/LoginPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { RegisterPage } from '../pages/register/RegisterPage';
import { getApiErrorMessage } from '../shared/api/errorMessage';
import { AppLink } from '../shared/routing/AppLink';
import { navigateTo, useCurrentPath } from '../shared/routing/navigation';
import './app.css';

function renderPage(path: string) {
  switch (path) {
    case '/register':
      return <RegisterPage />;
    case '/login':
      return <LoginPage />;
    case '/forgot-password':
      return <ForgotPasswordPage />;
    case '/profile':
      return <ProfilePage />;
    default:
      return <HomePage />;
  }
}

function AppShell() {
  const path = useCurrentPath();
  const { isAuthenticated, logout, profile, status } = useAuthSession();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError('');

    try {
      await logout();
      navigateTo('/login');
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, 'We could not log you out.'));
    } finally {
      setIsLoggingOut(false);
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
              : 'Signed out'}
        </div>
      </header>

      <nav className="nav-bar" aria-label="Primary">
        <AppLink className={path === '/' ? 'nav-link nav-link-active' : 'nav-link'} to="/">
          Home
        </AppLink>

        {isAuthenticated ? (
          <AppLink
            className={path === '/profile' ? 'nav-link nav-link-active' : 'nav-link'}
            to="/profile"
          >
            Profile
          </AppLink>
        ) : null}

        {!isAuthenticated && status !== 'loading' ? (
          <>
            <AppLink
              className={path === '/login' ? 'nav-link nav-link-active' : 'nav-link'}
              to="/login"
            >
              Login
            </AppLink>
            <AppLink
              className={path === '/register' ? 'nav-link nav-link-active' : 'nav-link'}
              to="/register"
            >
              Register
            </AppLink>
          </>
        ) : null}

        {isAuthenticated ? (
          <button
            className="nav-button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        ) : null}
      </nav>

      {logoutError ? (
        <p className="status-message status-error" role="alert">
          {logoutError}
        </p>
      ) : null}

      {renderPage(path)}
    </main>
  );
}

export function App() {
  return (
    <AuthSessionProvider>
      <AppShell />
    </AuthSessionProvider>
  );
}
