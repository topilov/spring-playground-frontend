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
  'If that email belongs to an account, a reset link will be sent.';

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
          <input autoComplete="email" type="email" {...form.register('email')} />
          {form.formState.errors.email ? (
            <span className="field-error" role="alert">
              {form.formState.errors.email.message}
            </span>
          ) : null}
        </label>

        <button
          className="primary-button"
          disabled={form.formState.isSubmitting || forgotPasswordMutation.isPending}
          type="submit"
        >
          {form.formState.isSubmitting || forgotPasswordMutation.isPending
            ? 'Submitting...'
            : 'Send reset link'}
        </button>

        {form.formState.errors.root ? (
          <p className="status-message status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>

      {successMessage ? (
        <p className="status-message status-success">{successMessage}</p>
      ) : null}
    </>
  );
}
