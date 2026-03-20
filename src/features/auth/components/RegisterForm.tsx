import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { AppLink } from '../../../shared/routing/AppLink';
import { routePaths } from '../../../shared/routing/paths';
import { useRegisterMutation } from '../mutations';
import { registerFormSchema, type RegisterFormValues } from '../forms';

export function RegisterForm() {
  const [successEmail, setSuccessEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const registerMutation = useRegisterMutation();
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

    try {
      const result = await registerMutation.mutateAsync(values);
      setSuccessEmail(result.email);
      setSuccessMessage(
        `Account created for ${result.username}. Check ${result.email} for a verification link before signing in.`
      );
      form.reset();
    } catch (error) {
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
          <input autoComplete="username" {...form.register('username')} />
          {form.formState.errors.username ? (
            <span className="field-error" role="alert">
              {form.formState.errors.username.message}
            </span>
          ) : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input autoComplete="email" type="email" {...form.register('email')} />
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
          disabled={form.formState.isSubmitting || registerMutation.isPending}
          type="submit"
        >
          {form.formState.isSubmitting || registerMutation.isPending
            ? 'Creating account...'
            : 'Create account'}
        </button>

        {form.formState.errors.root ? (
          <p className="status-message status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>

      {successMessage ? (
        <div className="stack">
          <p className="status-message status-success">{successMessage}</p>
          <AppLink
            className="secondary-button link-button"
            to={`${routePaths.verifyEmail}?email=${encodeURIComponent(successEmail)}`}
          >
            Open verification page
          </AppLink>
        </div>
      ) : null}
    </>
  );
}
