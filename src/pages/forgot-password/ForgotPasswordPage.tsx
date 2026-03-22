import { ForgotPasswordForm } from '../../features/auth/components/ForgotPasswordForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ForgotPasswordPage() {
  return (
    <AuthPageShell
      footer={
        <div className="auth-links auth-links-start">
          <AppLink className="text-link" to={routePaths.login}>
            Back to sign in
          </AppLink>
        </div>
      }
      subtitle="Enter your email to receive a reset link."
      title="Reset password"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
