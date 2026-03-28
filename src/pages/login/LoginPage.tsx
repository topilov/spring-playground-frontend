import { useLocation } from 'react-router-dom';

import { LoginForm } from '../../features/auth/components/LoginForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function LoginPage() {
  const location = useLocation();
  const authNotice =
    typeof location.state?.authNotice === 'string' ? location.state.authNotice : '';

  return (
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.forgotPassword}>
            Forgot password
          </AppLink>
          <AppLink className="text-link" to={routePaths.register}>
            Create account
          </AppLink>
        </div>
      }
      subtitle="Enter the account workspace with a password or a registered passkey."
      utility={
        <div className="stack">
          <p className="status-banner">
            Passkeys, passwords, and recovery all return to the same account.
          </p>
          {authNotice ? (
            <p className="status-banner" role="status">
              {authNotice}
            </p>
          ) : null}
        </div>
      }
      title="Sign in"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
