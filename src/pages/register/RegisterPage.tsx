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
      subtitle="Create a new account."
      title="Create account"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
