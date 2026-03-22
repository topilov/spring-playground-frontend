import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ProtectedRoute() {
  const location = useLocation();
  const { errorMessage, status } = useAuthSession();

  if (status === 'loading') {
    return (
      <AuthPageShell
        subtitle="One moment while we confirm access."
        title="Checking session"
      />
    );
  }

  if (status === 'anonymous') {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={routePaths.login}
      />
    );
  }

  if (status === 'error') {
    return (
      <AuthPageShell
        subtitle={errorMessage ?? 'We could not verify your session.'}
        title="Session unavailable"
      >
        <AppLink className="button button-primary button-full" to={routePaths.login}>
          Sign in
        </AppLink>
      </AuthPageShell>
    );
  }

  return <Outlet />;
}
