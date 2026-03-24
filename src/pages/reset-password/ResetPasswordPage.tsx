import { useLocation } from 'react-router-dom';

import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm';
import { getQueryParamValue } from '../../shared/routing/queryParams';
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

export function ResetPasswordPage() {
  const location = useLocation();
  const token = getQueryParamValue(location.search, 'token');

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
