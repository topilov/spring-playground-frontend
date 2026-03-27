import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';

import { verifyEmail } from '../../features/auth/api';
import { useResendVerificationEmailMutation } from '../../features/auth/mutations';
import {
  resendVerificationEmailFormSchema,
  type ResendVerificationEmailFormValues,
} from '../../features/auth/forms';
import { getApiErrorMessage } from '../../shared/api/errorMessage';
import { ProtectedStatusBanner } from '../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../shared/protection/useProtectedAction';
import { appConfig } from '../../shared/config/appConfig';
import { AppLink } from '../../shared/routing/AppLink';
import { routePaths } from '../../shared/routing/paths';
import { getQueryParamValue } from '../../shared/routing/queryParams';
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
    return 'Finish the link check, then recover operator access if needed.';
  }

  return 'Use the original verification link or dispatch another one from here.';
}

export function VerifyEmailPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [token] = useState(() => getQueryParamValue(location.search, 'token')?.trim() ?? '');
  const [verificationError, setVerificationError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'verified' | 'failed'
  >(token ? 'verifying' : 'idle');
  const [resendMessage, setResendMessage] = useState('');
  const resendVerificationEmailMutation = useResendVerificationEmailMutation();
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    enabled: appConfig.captchaRequired,
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });
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
    protectedAction.resetStatus();
    try {
      await protectedAction.execute({
        execute: (captchaToken) =>
          resendVerificationEmailMutation.mutateAsync({
            ...values,
            captchaToken,
          }),
      });
      setResendMessage(resendSuccessMessage);
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not send another verification email.'),
      });
    }
  });

  const hasResendInlineStatus =
    Boolean(resendMessage) ||
    Boolean(form.formState.errors.root) ||
    Boolean(protectedAction.errorMessage) ||
    Boolean(protectedAction.protection);

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
            <p className="status-banner" role="status">
              Checking your verification link...
            </p>
          ) : null}

          {verificationStatus === 'verified' ? (
            <p className="status-banner status-success" role="status">
              Email verified. Operator access is ready for sign-in.
            </p>
          ) : null}

          {verificationStatus === 'failed' ? (
            <p className="status-banner status-error" role="alert">
              {verificationError}
            </p>
          ) : null}

          {verificationStatus === 'idle' && !hasResendInlineStatus ? (
            <p className="status-banner" role="status">
              Open the email link, or request a new one below.
            </p>
          ) : null}

          {resendMessage ? (
            <p className="status-banner status-success" role="status">
              {resendMessage}
            </p>
          ) : null}

          {form.formState.errors.root ? (
            <p className="status-banner status-error" role="alert">
              {form.formState.errors.root.message}
            </p>
          ) : null}
        </div>
      }
      title="Verify email"
    >
      <p className="page-description">Need another link? Send it to the address below.</p>

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

        <TurnstileWidget controller={turnstileController} />
        <ProtectedStatusBanner
          errorMessage={protectedAction.errorMessage}
          protection={protectedAction.protection}
        />

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
      </form>
    </AuthPageShell>
  );
}
