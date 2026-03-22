import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { AppLink } from '../../../shared/routing/AppLink';
import { routePaths } from '../../../shared/routing/paths';
import { useResetPasswordMutation } from '../mutations';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '../forms';

interface ResetPasswordFormProps {
  token: string | null;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const resetPasswordMutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordFormValues>({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(resetPasswordFormSchema),
  });

  if (!token) {
    return (
      <div className="stack">
        <p className="status-banner status-error" role="alert">
          This reset link is invalid or incomplete.
        </p>
        <AppLink className="text-link" to={routePaths.login}>
          Back to sign in
        </AppLink>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="stack">
        <p className="status-banner status-success">
          Password updated.
        </p>
        <AppLink className="text-link" to={routePaths.login}>
          Back to sign in
        </AppLink>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
      setIsSuccess(true);
      form.reset();
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not reset your password.'),
      });
    }
  });

  return (
    <form className="stack" onSubmit={onSubmit}>
      <label className="field">
        <span>New password</span>
        <input
          autoComplete="new-password"
          placeholder="Create a new password"
          type="password"
          {...form.register('newPassword')}
        />
        {form.formState.errors.newPassword ? (
          <span className="field-error" role="alert">
            {form.formState.errors.newPassword.message}
          </span>
        ) : null}
      </label>

      <label className="field">
        <span>Confirm new password</span>
        <input
          autoComplete="new-password"
          placeholder="Repeat your new password"
          type="password"
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword ? (
          <span className="field-error" role="alert">
            {form.formState.errors.confirmPassword.message}
          </span>
        ) : null}
      </label>

      <button
        className="button button-primary button-full"
        disabled={form.formState.isSubmitting || resetPasswordMutation.isPending}
        type="submit"
      >
        {form.formState.isSubmitting || resetPasswordMutation.isPending
          ? 'Resetting...'
          : 'Reset password'}
      </button>

      {form.formState.errors.root ? (
        <p className="status-banner status-error" role="alert">
          {form.formState.errors.root.message}
        </p>
      ) : null}
    </form>
  );
}
