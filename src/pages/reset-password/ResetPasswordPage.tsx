import { useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <AuthPageShell
      subtitle="Set a new password for your account."
      title="Reset password"
    >
      <ResetPasswordForm token={token} />
    </AuthPageShell>
  );
}
