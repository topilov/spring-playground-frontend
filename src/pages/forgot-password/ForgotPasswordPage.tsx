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
      subtitle="Request a fresh password reset link for an existing account."
      utility={
        <p className="status-banner">
          Enter the account email exactly as registered. If the inbox stays quiet,
          check spam before sending another request.
        </p>
      }
      title="Reset password"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
