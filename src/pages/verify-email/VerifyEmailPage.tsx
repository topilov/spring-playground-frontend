import { type FormEvent, useEffect, useState } from 'react';

import type { ResendVerificationEmailInput } from '../../entities/auth/model';
import { resendVerificationEmail, verifyEmail } from '../../features/auth/api';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';

const resendSuccessMessage =
  'If that email belongs to an unverified account, a fresh verification link will be sent.';

function readTokenFromSearch(search: string): string {
  return new URLSearchParams(search).get('token')?.trim() ?? '';
}

function readEmailFromSearch(search: string): string {
  return new URLSearchParams(search).get('email')?.trim() ?? '';
}

export function VerifyEmailPage() {
  const [token] = useState(() => readTokenFromSearch(window.location.search));
  const [emailForm, setEmailForm] = useState<ResendVerificationEmailInput>(() => ({
    email: readEmailFromSearch(window.location.search),
  }));
  const [verificationError, setVerificationError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(token ? 'verifying' : 'idle');
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let isCancelled = false;

    const runVerification = async () => {
      try {
        await verifyEmail({ token });

        if (!isCancelled) {
          setVerificationStatus('verified');
        }
      } catch (error) {
        if (!isCancelled) {
          setVerificationStatus('failed');
          setVerificationError(
            getApiErrorMessage(error, 'We could not verify this email link.')
          );
        }
      }
    };

    void runVerification();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const handleResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsResending(true);
    setResendError('');
    setResendMessage('');

    try {
      await resendVerificationEmail(emailForm);
      setResendMessage(resendSuccessMessage);
    } catch (error) {
      setResendError(
        getApiErrorMessage(error, 'We could not send another verification email.')
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="auth-layout">
      <article className="form-card">
        <p className="eyebrow">Email Verification</p>
        <h1>Confirm your email address</h1>
        <p className="section-copy">
          New accounts stay signed out until the backend accepts the verification
          token from your email link.
        </p>

        {verificationStatus === 'verifying' ? (
          <p className="status-message">Checking your verification link...</p>
        ) : null}

        {verificationStatus === 'verified' ? (
          <p className="status-message status-success">
            Your email is verified. You can sign in now.
          </p>
        ) : null}

        {verificationStatus === 'failed' ? (
          <p className="status-message status-error" role="alert">
            {verificationError}
          </p>
        ) : null}

        {verificationStatus === 'idle' ? (
          <p className="status-message">
            Open the verification link from your email, or request a fresh one
            below.
          </p>
        ) : null}

        <div className="action-row">
          <AppLink className="primary-button link-button" to="/login">
            Go to login
          </AppLink>
          <AppLink className="secondary-button link-button" to="/register">
            Back to register
          </AppLink>
        </div>

        <form className="stack" onSubmit={handleResend}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={(event) =>
                setEmailForm({
                  email: event.target.value,
                })
              }
              required
              type="email"
              value={emailForm.email}
            />
          </label>

          <button className="secondary-button" disabled={isResending} type="submit">
            {isResending ? 'Sending verification email...' : 'Resend verification email'}
          </button>
        </form>

        {resendError ? (
          <p className="status-message status-error" role="alert">
            {resendError}
          </p>
        ) : null}

        {resendMessage ? (
          <p className="status-message status-success">{resendMessage}</p>
        ) : null}
      </article>
    </section>
  );
}
