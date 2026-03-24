import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import {
  passwordChangeFormSchema,
  type PasswordChangeFormValues,
} from '../forms';
import { changeCurrentPassword } from '../api';

export function PasswordChangeSection() {
  const [successMessage, setSuccessMessage] = useState('');
  const form = useForm<PasswordChangeFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: zodResolver(passwordChangeFormSchema),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors('root');
    setSuccessMessage('');

    try {
      await changeCurrentPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccessMessage('Password updated.');
      form.reset();
    } catch (error) {
      form.setError('root', {
        message: getApiErrorMessage(error, 'We could not update your password.'),
      });
    }
  });

  return (
    <section className="workspace-band workspace-band-primary stack">
      <div className="workspace-band-header">
        <div className="section-heading">
          <h2>Password</h2>
          <p className="page-description">
            Change the current password after confirming the existing one.
          </p>
        </div>
        <p className="workspace-note">
          The backend validates the current password before saving the new one.
        </p>
      </div>

      <form className="stack" onSubmit={onSubmit}>
        <label className="field">
          <span>Current password</span>
          <input
            autoComplete="current-password"
            placeholder="Enter current password"
            type="password"
            {...form.register('currentPassword')}
          />
          {form.formState.errors.currentPassword ? (
            <span className="field-error" role="alert">
              {form.formState.errors.currentPassword.message}
            </span>
          ) : null}
        </label>

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
            placeholder="Repeat the new password"
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
          className="button button-primary"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting ? 'Saving password...' : 'Change password'}
        </button>

        {successMessage ? (
          <p className="status-banner status-success" role="status">
            {successMessage}
          </p>
        ) : null}

        {form.formState.errors.root ? (
          <p className="status-banner status-error" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </form>
    </section>
  );
}
