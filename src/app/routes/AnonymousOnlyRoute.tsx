import { Navigate, Outlet } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { routePaths } from '../../shared/routing/paths';

export function AnonymousOnlyRoute() {
  const { status } = useAuthSession();

  if (status === 'loading') {
    return (
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">Session</p>
          <h1>Preparing your account flow</h1>
          <p className="section-copy">
            Checking whether you already have an active session.
          </p>
        </article>
      </section>
    );
  }

  if (status === 'authenticated') {
    return <Navigate replace to={routePaths.profile} />;
  }

  return <Outlet />;
}
