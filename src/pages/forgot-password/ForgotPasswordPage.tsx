import { type FormEvent, useState } from 'react';

import type { ForgotPasswordInput } from '../../entities/auth/model';
import { forgotPassword } from '../../features/auth/api';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';

const initialForm: ForgotPasswordInput = {
  email: '',
};

const genericSuccessMessage =
  'If that email belongs to an account, a reset link will be sent.';

export function ForgotPasswordPage() {
  const [form, setForm] = useState<ForgotPasswordInput>(initialForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await forgotPassword(form);
      setSuccessMessage(genericSuccessMessage);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, 'We could not submit your reset request.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Forgot Password</p>
        <h1>Request a reset link</h1>
        <p className="section-copy">
          The backend returns the same accepted response whether or not the email
          exists, so this screen stays intentionally generic.
        </p>

        <form className="stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) =>
                setForm({
                  email: event.target.value,
                })
              }
              required
              type="email"
              value={form.email}
            />
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Send reset link'}
          </button>
        </form>

        {errorMessage ? (
          <p className="status-message status-error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="status-message status-success">{successMessage}</p>
        ) : null}

        <p className="helper-links">
          Back to <AppLink to="/login">login</AppLink>
        </p>
      </article>
    </section>
  );
}
