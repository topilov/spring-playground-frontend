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
        subtitle="Loading your workspace entry."
        title="Checking session"
      />
    );
  }

  if (status === 'authenticated') {
    return <Navigate replace to={routePaths.profile} />;
  }

  return (
    <AuthPageShell
      subtitle="Identity workspace for profile access, sign-in checks, and account recovery."
      utility={
        <div className="stack">
          <p className="status-banner" role="status">
            Start from sign-in if the account already exists, or open a new one and verify it.
          </p>
          <dl className="detail-rows">
            <div className="detail-row detail-row-wide">
              <dt>Passkeys</dt>
              <dd>Use trusted devices for faster sign-in without changing the same account flow.</dd>
            </div>
            <div className="detail-row detail-row-wide">
              <dt>Two-factor</dt>
              <dd>Keep an extra verification step available when account access needs more proof.</dd>
            </div>
            <div className="detail-row detail-row-wide">
              <dt>Telegram</dt>
              <dd>Connect messaging once you are inside the workspace and keep account tools together.</dd>
            </div>
          </dl>
        </div>
      }
      title="Spring Playground"
    >
      <div className="stack">
        <p>
          Choose the path that matches the account state and stay inside one quiet product entry.
        </p>
        <AppLink className="button button-primary button-full" to={routePaths.login}>
          Sign in
        </AppLink>
        <AppLink className="button button-secondary button-full" to={routePaths.register}>
          Create account
        </AppLink>
        <AppLink className="text-link" to={routePaths.forgotPassword}>
          Forgot password
        </AppLink>
      </div>
    </AuthPageShell>
  );
}
