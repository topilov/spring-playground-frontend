import { RegisterForm } from '../../features/auth/components/RegisterForm';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

export function RegisterPage() {
  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Register</p>
        <h1>Create an account</h1>
        <p className="section-copy">
          Registration creates the auth user and the default profile, but it does
          not sign you in.
        </p>

        <RegisterForm />

        <p className="helper-links">
          Already registered? <AppLink to={routePaths.login}>Go to login</AppLink>
        </p>
      </article>
    </section>
  );
}
