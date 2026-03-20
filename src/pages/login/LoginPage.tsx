import { type FormEvent, useState } from 'react';

import type { LoginCredentials } from '../../entities/session/model';
import { isEmailNotVerifiedError } from '../../features/auth/errors';
import { useAuthSession } from '../../features/auth/session/useAuthSession';
import { ApiClientError } from '../../shared/api/apiClient';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { navigateTo } from '../../shared/routing/navigation';

const initialForm: LoginCredentials = {
  usernameOrEmail: '',
  password: '',
};

export function LoginPage() {
  const { isAuthenticated, login, profile } = useAuthSession();
  const [form, setForm] = useState<LoginCredentials>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [showVerificationCta, setShowVerificationCta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setShowVerificationCta(false);

    try {
      await login(form);
      navigateTo('/profile');
    } catch (error) {
      if (isEmailNotVerifiedError(error)) {
        setErrorMessage(
          'Your email is not verified yet. Confirm it from your inbox or request a new verification link.'
        );
        setShowVerificationCta(true);
      } else if (error instanceof ApiClientError && error.status === 401) {
        setErrorMessage('Invalid username/email or password.');
      } else {
        setErrorMessage(getApiErrorMessage(error, 'We could not sign you in.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated && profile) {
    return (
      <section className="auth-layout">
        <article className="form-card">
          <p className="eyebrow">Login</p>
          <h1>You are already signed in</h1>
          <p className="section-copy">
            Your current session belongs to {profile.username}. You can go
            straight to your profile.
          </p>
          <AppLink className="primary-button link-button" to="/profile">
            Open profile
          </AppLink>
        </article>
      </section>
    );
  }

  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Login</p>
        <h1>Sign in with your session account</h1>
        <p className="section-copy">
          Successful login sets the backend-managed `JSESSIONID` cookie and then
          refreshes the profile view.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username or Email</span>
            <input
              autoComplete="username"
              name="usernameOrEmail"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  usernameOrEmail: event.target.value,
                }))
              }
              required
              value={form.usernameOrEmail}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
              type="password"
              value={form.password}
            />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {errorMessage ? (
          <div className="stack">
            <p className="status-message status-error" role="alert">
              {errorMessage}
            </p>
            {showVerificationCta ? (
              <AppLink
                className="secondary-button link-button"
                to={
                  form.usernameOrEmail.includes('@')
                    ? `/verify-email?email=${encodeURIComponent(form.usernameOrEmail)}`
                    : '/verify-email'
                }
              >
                Open email verification
              </AppLink>
            ) : null}
          </div>
        ) : null}

        <p className="helper-links">
          Need a password reset?{' '}
          <AppLink to="/forgot-password">Use forgot password</AppLink>
        </p>
      </article>
    </section>
  );
}
