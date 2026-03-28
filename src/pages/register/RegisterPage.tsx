import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function RegisterPage() {
  return (
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.login}>
            Sign in
          </AppLink>
        </div>
      }
      subtitle="Create the account you will use for profile access, sign-in checks, and recovery."
      utility={
        <p className="status-banner">
          Use an address you can verify now. Sign-in stays paused until email verification is
          complete.
        </p>
      }
      title="Create account"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
