import { useSearchParams } from 'react-router-dom';

import { ResetPasswordForm } from '../../features/auth/components/ResetPasswordForm';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Reset Password</p>
        <h1>Set a new password</h1>
        <p className="section-copy">
          Choose a new password for your account using the reset link from your
          email.
        </p>

        <ResetPasswordForm token={token} />
      </article>
    </section>
  );
}
