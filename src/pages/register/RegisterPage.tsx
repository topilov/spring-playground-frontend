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
      subtitle="Create an operator account and verify it before first access."
      utility={
        <p className="status-banner">
          Use an address you can verify now. Sign-in remains locked until email
          verification completes.
        </p>
      }
      title="Create account"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
