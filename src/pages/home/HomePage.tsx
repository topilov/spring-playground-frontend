import { Navigate } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function HomePage() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <AuthPageShell
        subtitle="Opening your account."
        title="Checking session"
      />
    );
  }

  if (status === 'authenticated') {
    return <Navigate replace to={routePaths.profile} />;
  }

  return <Navigate replace to={routePaths.login} />;
}
