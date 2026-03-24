import { useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <AuthPageShell
      subtitle="Set a new password and return to operator access."
      utility={
        <p className="status-banner">
          Use the link from your inbox. If it expires, request a fresh reset from
          sign in.
        </p>
      }
      title="Reset password"
    >
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
