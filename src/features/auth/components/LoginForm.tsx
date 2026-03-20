import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiClientError } from '../../../shared/api/apiClient';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { isAppPath, routePaths } from '../../../shared/routing/paths';
import { AppLink } from '../../../shared/routing/AppLink';
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

    try {
      await loginMutation.mutateAsync(values);
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

      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not sign you in.'),
      });
    }
  });

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label className="field">
        <span>Username or Email</span>
        <input autoComplete="username" {...form.register('usernameOrEmail')} />
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
          type="password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <span className="field-error" role="alert">
            {form.formState.errors.password.message}
          </span>
        ) : null}
      </label>

      <button
        className="primary-button"
        disabled={form.formState.isSubmitting || loginMutation.isPending}
        type="submit"
      >
        {form.formState.isSubmitting || loginMutation.isPending
          ? 'Signing in...'
          : 'Sign in'}
      </button>

      {form.formState.errors.root ? (
        <div className="stack">
          <p className="status-message status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
          {showVerificationCta ? (
            <AppLink
              className="secondary-button link-button"
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
