import { Navigate } from 'react-router-dom';

import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { AppLink } from '../../shared/routing/AppLink';
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

  return (
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.login}>
            Sign in
          </AppLink>
          <AppLink className="text-link" to={routePaths.register}>
            Create account
          </AppLink>
        </div>
      }
      subtitle="A calm place to explore account access, profile tools, and session flows."
      utility={
        <p className="status-banner">
          Start with sign-in if you already have an operator account, or create one to begin.
        </p>
      }
      title="Spring Playground"
    >
      <div className="stack">
        <p>
          Follow the public entry path to sign in, create an account, or recover access without
          jumping straight into a redirect.
        </p>
        <AppLink className="button button-primary button-full" to={routePaths.login}>
          Sign in
        </AppLink>
        <AppLink className="button button-secondary button-full" to={routePaths.register}>
          Create account
        </AppLink>
      </div>
    </AuthPageShell>
  );
}
