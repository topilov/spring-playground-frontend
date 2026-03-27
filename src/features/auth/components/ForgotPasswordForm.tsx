import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { ProtectedStatusBanner } from '../../../shared/protection/ProtectedStatusBanner';
import { TurnstileWidget } from '../../../shared/protection/turnstile/TurnstileWidget';
import { useTurnstileController } from '../../../shared/protection/turnstile/useTurnstileController';
import { useProtectedAction } from '../../../shared/protection/useProtectedAction';
import { appConfig } from '../../../shared/config/appConfig';
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
  const turnstileController = useTurnstileController();
  const protectedAction = useProtectedAction({
    enabled: appConfig.captchaRequired,
    acquireToken: () => turnstileController.acquireToken(),
    reset: () => turnstileController.reset(),
  });
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setSuccessMessage('');
    protectedAction.resetStatus();

    try {
      await protectedAction.execute({
        execute: (captchaToken) =>
          forgotPasswordMutation.mutateAsync({
            ...values,
            captchaToken,
          }),
      });
      setSuccessMessage(genericSuccessMessage);
      form.reset();
    } catch (error) {
      if (protectedAction.wasHandledError(error)) {
        return;
      }

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

        <TurnstileWidget controller={turnstileController} />
        <ProtectedStatusBanner
          errorMessage={protectedAction.errorMessage}
          protection={protectedAction.protection}
        />

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
