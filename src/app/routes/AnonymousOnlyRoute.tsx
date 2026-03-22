import { Navigate, Outlet } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function AnonymousOnlyRoute() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <AuthPageShell
        subtitle="One moment while we check your session."
        title="Checking session"
      />
    );
  }

  if (status === 'authenticated') {
    return <Navigate replace to={routePaths.profile} />;
  }

  return <Outlet />;
}
