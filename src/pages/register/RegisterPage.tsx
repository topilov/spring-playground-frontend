import { type FormEvent, useState } from 'react';

import type { RegisterInput } from '../../entities/auth/model';
import { register } from '../../features/auth/api';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';

const initialForm: RegisterInput = {
  username: '',
  email: '',
  password: '',
};

export function RegisterPage() {
  const [form, setForm] = useState<RegisterInput>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessEmail('');
    setSuccessMessage('');

    try {
      const result = await register(form);
      setSuccessMessage(
        `Account created for ${result.username}. Check ${result.email} for a verification link before signing in.`
      );
      setSuccessEmail(result.email);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'We could not create your account.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Register</p>
        <h1>Create an account</h1>
        <p className="section-copy">
          Registration creates the auth user and the default profile, but it does
          not sign you in. New accounts must confirm email before login succeeds.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              required
              value={form.username}
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="new-password"
              name="password"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
              minLength={8}
              type="password"
              value={form.password}
            />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {errorMessage ? (
          <p className="status-message status-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <div className="stack">
            <p className="status-message status-success">{successMessage}</p>
            <AppLink
              className="secondary-button link-button"
              to={`/verify-email?email=${encodeURIComponent(successEmail)}`}
            >
              Open verification page
            </AppLink>
          </div>
        ) : null}

        <p className="helper-links">
          Already registered? <AppLink to="/login">Go to login</AppLink>
        </p>
      </article>
    </section>
  );
}
