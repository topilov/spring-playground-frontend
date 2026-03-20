import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { verifyEmail } from '../../features/auth/api';
import { useResendVerificationEmailMutation } from '../../features/auth/mutations';
import {
  resendVerificationEmailFormSchema,
  type ResendVerificationEmailFormValues,
} from '../../features/auth/forms';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';

const resendSuccessMessage =
  'If that email belongs to an unverified account, a fresh verification link will be sent.';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() ?? '');
  const [verificationError, setVerificationError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(token ? 'verifying' : 'idle');
  const [resendMessage, setResendMessage] = useState('');
  const resendVerificationEmailMutation = useResendVerificationEmailMutation();
  const form = useForm<ResendVerificationEmailFormValues>({
    defaultValues: {
      email: searchParams.get('email')?.trim() ?? '',
    },
    resolver: zodResolver(resendVerificationEmailFormSchema),
  });

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

  const handleResend = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setResendMessage('');
    try {
      await resendVerificationEmailMutation.mutateAsync(values);
      setResendMessage(resendSuccessMessage);
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not send another verification email.'),
      });
    }
  });

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
          <AppLink className="primary-button link-button" to={routePaths.login}>
            Go to login
          </AppLink>
          <AppLink className="secondary-button link-button" to={routePaths.register}>
            Back to register
          </AppLink>
        </div>

        <form className="stack" onSubmit={handleResend}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              {...form.register('email')}
            />
            {form.formState.errors.email ? (
              <span className="field-error" role="alert">
                {form.formState.errors.email.message}
              </span>
            ) : null}
          </label>

          <button
            className="secondary-button"
            disabled={
              form.formState.isSubmitting || resendVerificationEmailMutation.isPending
            }
            type="submit"
          >
            {form.formState.isSubmitting || resendVerificationEmailMutation.isPending
              ? 'Sending verification email...'
              : 'Resend verification email'}
          </button>

          {form.formState.errors.root ? (
            <p className="status-message status-error" role="alert">
              {form.formState.errors.root.message}
            </p>
          ) : null}
        </form>

        {resendMessage ? (
          <p className="status-message status-success">{resendMessage}</p>
        ) : null}
      </article>
    </section>
  );
}
