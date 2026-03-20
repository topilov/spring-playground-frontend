import { LoginForm } from '../../features/auth/components/LoginForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

export function LoginPage() {
  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Login</p>
        <h1>Sign in with your session account</h1>
        <p className="section-copy">
          Successful login sets the backend-managed `JSESSIONID` cookie and then
          refreshes the profile view.
        </p>

        <LoginForm />

        <p className="helper-links">
          Need a password reset?{' '}
          <AppLink to={routePaths.forgotPassword}>Use forgot password</AppLink>
        </p>
      </article>
    </section>
  );
}
