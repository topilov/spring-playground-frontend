import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { routePaths } from '../../shared/routing/paths';

export function ProtectedRoute() {
  const location = useLocation();
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">Session</p>
          <h1>Checking your session</h1>
          <p className="section-copy">
            Verifying the current backend session before opening this page.
          </p>
        </article>
      </section>
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

  return <Outlet />;
}
