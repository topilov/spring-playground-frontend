import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { useForgotPasswordMutation } from '../mutations';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '../forms';

const genericSuccessMessage =
  'If that address exists, you will receive a reset link.';

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState('');
  const forgotPasswordMutation = useForgotPasswordMutation();
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setSuccessMessage('');

    try {
      await forgotPasswordMutation.mutateAsync(values);
      setSuccessMessage(genericSuccessMessage);
      form.reset();
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not submit your reset request.'),
      });
    }
  });

  return (
    <>
      <form className="stack" onSubmit={onSubmit}>
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
          className="button button-primary button-full"
          disabled={form.formState.isSubmitting || forgotPasswordMutation.isPending}
          type="submit"
        >
          {form.formState.isSubmitting || forgotPasswordMutation.isPending
            ? 'Submitting...'
            : 'Send reset link'}
        </button>

        {form.formState.errors.root ? (
          <p className="status-banner status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>

      {successMessage ? (
        <p className="status-banner status-success">{successMessage}</p>
      ) : null}
    </>
  );
}
