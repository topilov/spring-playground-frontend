import { LoginForm } from '../../features/auth/components/LoginForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function LoginPage() {
  return (
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.forgotPassword}>
            Forgot password?
          </AppLink>
          <AppLink className="text-link" to={routePaths.register}>
            Create account
          </AppLink>
        </div>
      }
      subtitle="Use your account details or a passkey."
      title="Sign in"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
