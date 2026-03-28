import { useLocation } from 'react-router-dom';

import { LoginForm } from '../../features/auth/components/LoginForm';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function LoginPage() {
  const location = useLocation();
  const authNotice =
    typeof location.state?.authNotice === 'string' ? location.state.authNotice : '';

  return (
    <AuthPageShell
      subtitle="Enter the account workspace with a password or a registered passkey."
      utility={
        <div className="stack">
          <p className="status-banner" role="status">
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
