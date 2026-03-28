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
      subtitle="Request a fresh reset link for the account you want to reopen."
      utility={
        <p className="status-banner">
          Use the account email exactly as registered. If the inbox stays quiet, check spam
          before sending another request.
        </p>
      }
      title="Reset password"
    >
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
