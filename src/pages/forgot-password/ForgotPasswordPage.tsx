import { ForgotPasswordForm } from '../../features/auth/components/ForgotPasswordForm';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ForgotPasswordPage() {
  return (
    <AuthPageShell
      subtitle="Request a fresh reset link for the account you want to reopen."
      utility={
        <p className="status-banner" role="status">
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
