import { ForgotPasswordForm } from '../../features/auth/components/ForgotPasswordForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

export function ForgotPasswordPage() {
  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Forgot Password</p>
        <h1>Request a reset link</h1>
        <p className="section-copy">
          The backend returns the same accepted response whether or not the email
          exists, so this screen stays intentionally generic.
        </p>

        <ForgotPasswordForm />

        <p className="helper-links">
          Back to <AppLink to={routePaths.login}>login</AppLink>
        </p>
      </article>
    </section>
  );
}
