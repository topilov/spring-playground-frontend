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
import { AuthPageShell } from '../../shared/ui/AuthPageShell';

const resendSuccessMessage =
  'If that email is still unverified, a new link has been sent.';

function getShellSubtitle(
  verificationStatus: 'idle' | 'verifying' | 'verified' | 'failed',
  hasToken: boolean
) {
  if (verificationStatus === 'verified') {
    return 'Verification complete. Return to operator access when ready.';
  }

  if (hasToken) {
    return 'Complete the verification check and recover access if needed.';
  }

  return 'Use the original verification link or send another one to continue.';
}

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
    <AuthPageShell
      footer={
        <div className="auth-links">
          <AppLink className="text-link" to={routePaths.login}>
            Sign in
          </AppLink>
          <AppLink className="text-link" to={routePaths.register}>
            Create account
          </AppLink>
        </div>
      }
      subtitle={getShellSubtitle(verificationStatus, Boolean(token))}
      utility={
        <div className="stack">
          {verificationStatus === 'verifying' ? (
            <p className="status-banner">Checking your verification link...</p>
          ) : null}

          {verificationStatus === 'verified' ? (
            <p className="status-banner status-success">
              Email verified. You can sign in now.
            </p>
          ) : null}

          {verificationStatus === 'failed' ? (
            <p className="status-banner status-error" role="alert">
              {verificationError}
            </p>
          ) : null}

          {verificationStatus === 'idle' ? (
            <p className="status-banner">
              Open the email link, or request a new one below.
            </p>
          ) : null}

          {resendMessage ? (
            <p className="status-banner status-success">{resendMessage}</p>
          ) : null}
        </div>
      }
      title="Verify email"
    >
      <p className="status-banner">
        Need another link? Send it to the email address below.
      </p>

      <form className="stack" onSubmit={handleResend}>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            placeholder="name@example.com"
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
          className="button button-secondary button-full"
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
          <p className="status-banner status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>
    </AuthPageShell>
  );
}
