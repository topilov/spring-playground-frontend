import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useLogoutMutation } from '../../features/auth/mutations';
import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { routePaths } from '../../shared/routing/paths';
import { AppShell } from './AppShell';
import { PublicShell } from './PublicShell';

interface AppLayoutProps {
  shell: 'app' | 'public';
}

export function AppLayout({ shell }: AppLayoutProps) {
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
      ? 'Checking operator session'
      : isAuthenticated && profile
        ? `Signed in as ${profile.displayName}`
        : null;

  if (shell === 'public') {
    return (
      <PublicShell
        sessionContext={sessionContext}
        showAnonymousActions={!isAuthenticated && status !== 'loading'}
      >
        <Outlet />
      </PublicShell>
    );
  }

  return (
    <AppShell
      logoutError={logoutError}
      onLogout={handleLogout}
      sessionContext={sessionContext}
      signingOut={logoutMutation.isPending}
    >
      <Outlet />
    </AppShell>
  );
}
