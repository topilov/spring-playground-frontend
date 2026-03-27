import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiClientError } from '../../../shared/api/apiClient';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { ProtectedStatusBanner } from '../../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../../shared/protection/useProtectedAction';
import { isAppPath, routePaths } from '../../../shared/routing/paths';
import { AppLink } from '../../../shared/routing/AppLink';
import { appConfig } from '../../../shared/config/appConfig';
import { isTwoFactorLoginChallenge } from '../../../entities/session/model';
import {
  savePendingTwoFactorLoginChallenge,
} from '../../two-factor/challengeStorage';
import { usePasskeyLoginMutation } from '../../passkeys/hooks';
import { isEmailNotVerifiedError } from '../errors';
import { useLoginMutation } from '../mutations';
import { loginFormSchema, type LoginFormValues } from '../forms';

function getRedirectTarget(from: unknown) {
  return isAppPath(from) ? from : routePaths.profile;
}

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLoginMutation();
  const passkeyLoginMutation = usePasskeyLoginMutation();
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    enabled: appConfig.captchaRequired,
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });
  const [showVerificationCta, setShowVerificationCta] = useState(false);
  const form = useForm<LoginFormValues>({
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setShowVerificationCta(false);
    protectedAction.resetStatus();

    try {
      const result = await protectedAction.execute({
        execute: (captchaToken) =>
          loginMutation.mutateAsync({
            ...values,
            captchaToken,
          }),
      });

      if (isTwoFactorLoginChallenge(result)) {
        savePendingTwoFactorLoginChallenge({
          loginChallengeId: result.loginChallengeId,
          methods: result.methods,
          expiresAt: result.expiresAt,
          redirectTo: getRedirectTarget(location.state?.from),
        });
        navigate(routePaths.loginTwoFactor, {
          replace: true,
        });
        return;
      }

      navigate(getRedirectTarget(location.state?.from), {
        replace: true,
      });
    } catch (error) {
      if (isEmailNotVerifiedError(error)) {
        setShowVerificationCta(true);
        form.setError('root', {
          message:
            'Your email is not verified yet. Confirm it from your inbox or request a new verification link.',
        });
        return;
      }

      if (error instanceof ApiClientError && error.status === 401) {
        form.setError('root', {
          message: 'Invalid username/email or password.',
        });
        return;
      }

      if (protectedAction.wasHandledError(error)) {
        return;
      }

      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not sign you in.'),
      });
    }
  });

  const handlePasskeyLogin = async () => {
    form.clearErrors('root');
    setShowVerificationCta(false);
    protectedAction.resetStatus();

    try {
      const usernameOrEmail = form.getValues('usernameOrEmail').trim();

      await protectedAction.execute({
        execute: (captchaToken) =>
          passkeyLoginMutation.mutateAsync(
            usernameOrEmail ? { usernameOrEmail, captchaToken } : { captchaToken }
          ),
      });
      navigate(getRedirectTarget(location.state?.from), {
        replace: true,
      });
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not sign you in with a passkey.'),
      });
    }
  };

  const isSubmitting =
    form.formState.isSubmitting ||
    loginMutation.isPending ||
    passkeyLoginMutation.isPending;

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label className="field">
        <span>Email or username</span>
        <input
          autoComplete="username"
          placeholder="name@example.com"
          {...form.register('usernameOrEmail')}
        />
        {form.formState.errors.usernameOrEmail ? (
          <span className="field-error" role="alert">
            {form.formState.errors.usernameOrEmail.message}
          </span>
        ) : null}
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete="current-password"
          placeholder="Enter your password"
          type="password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <span className="field-error" role="alert">
            {form.formState.errors.password.message}
          </span>
        ) : null}
      </label>

      <TurnstileWidget controller={turnstileController} />
      <ProtectedStatusBanner
        errorMessage={protectedAction.errorMessage}
        protection={protectedAction.protection}
      />

      <button
        className="button button-primary button-full"
        disabled={isSubmitting}
        type="submit"
      >
        {form.formState.isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </button>

      <button
        className="button button-secondary button-full"
        disabled={isSubmitting}
        onClick={handlePasskeyLogin}
        type="button"
      >
        {passkeyLoginMutation.isPending
          ? 'Checking passkeys...'
          : 'Sign in with passkey'}
      </button>

      {form.formState.errors.root ? (
        <div className="stack">
          <p className="status-banner status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
          {showVerificationCta ? (
            <AppLink
              className="button button-secondary button-full"
              to={
                form.getValues('usernameOrEmail').includes('@')
                  ? `${routePaths.verifyEmail}?email=${encodeURIComponent(
                      form.getValues('usernameOrEmail')
                    )}`
                  : routePaths.verifyEmail
              }
            >
              Open email verification
            </AppLink>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
