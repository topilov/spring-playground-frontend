import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { ProtectedStatusBanner } from '../../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../../shared/protection/useProtectedAction';
import { AppLink } from '../../../shared/routing/AppLink';
import { routePaths } from '../../../shared/routing/paths';
import { useRegisterMutation } from '../mutations';
import { registerFormSchema, type RegisterFormValues } from '../forms';

export function RegisterForm() {
  const [successEmail, setSuccessEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const registerMutation = useRegisterMutation();
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setSuccessEmail('');
    setSuccessMessage('');
    protectedAction.resetStatus();

    try {
      const result = await protectedAction.execute({
        execute: (captchaToken) =>
          registerMutation.mutateAsync({
            ...values,
            captchaToken,
          }),
      });
      setSuccessEmail(result.email);
      setSuccessMessage(`Account created. Verify ${result.email} before signing in.`);
      form.reset();
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not create your account.'),
      });
    }
  });

  return (
    <>
      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            autoComplete="username"
            placeholder="Choose a username"
            {...form.register('username')}
          />
          {form.formState.errors.username ? (
            <span className="field-error" role="alert">
              {form.formState.errors.username.message}
            </span>
          ) : null}
        </label>

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

        <label className="field">
          <span>Password</span>
          <input
            autoComplete="new-password"
            placeholder="Create a password"
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
          disabled={form.formState.isSubmitting || registerMutation.isPending}
          type="submit"
        >
          {form.formState.isSubmitting || registerMutation.isPending
            ? 'Creating account...'
            : 'Create account'}
        </button>

        {form.formState.errors.root ? (
          <p className="status-banner status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>

      {successMessage ? (
        <div className="stack">
          <p className="status-banner status-success">{successMessage}</p>
          <AppLink
            className="button button-secondary button-full"
            to={`${routePaths.verifyEmail}?email=${encodeURIComponent(successEmail)}`}
          >
            Open verification page
          </AppLink>
        </div>
      ) : null}
    </>
  );
}
