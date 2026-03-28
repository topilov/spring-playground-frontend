import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuthSession } from '../../auth/session/useAuthSession';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import {
  emailChangeFormSchema,
  type EmailChangeFormValues,
  type UsernameSettingsFormValues,
  usernameSettingsFormSchema,
} from '../forms';
import { requestCurrentEmailChange, updateCurrentUsername } from '../api';

export function AccountSettingsSection() {
  const { profile, refreshSession } = useAuthSession();
  const [usernameSuccessMessage, setUsernameSuccessMessage] = useState('');
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');
  const usernameForm = useForm<UsernameSettingsFormValues>({
    defaultValues: {
      username: profile?.username ?? '',
    },
    resolver: zodResolver(usernameSettingsFormSchema),
  });
  const emailForm = useForm<EmailChangeFormValues>({
    defaultValues: {
      newEmail: '',
    },
    resolver: zodResolver(emailChangeFormSchema),
  });

  const handleUsernameSubmit = usernameForm.handleSubmit(async (values) => {
    usernameForm.clearErrors('root');
    setUsernameSuccessMessage('');

    try {
      await updateCurrentUsername({
        username: values.username.trim(),
      });
      await refreshSession();
      setUsernameSuccessMessage('Username updated.');
    } catch (error) {
      usernameForm.setError('root', {
        message: getApiErrorMessage(error, 'We could not update your username.'),
      });
    }
  });

  const handleEmailSubmit = emailForm.handleSubmit(async (values) => {
    emailForm.clearErrors('root');
    setEmailSuccessMessage('');

    try {
      await requestCurrentEmailChange({
        newEmail: values.newEmail.trim(),
      });
      setEmailSuccessMessage(
        'Email change requested. Check the new address for a verification link.'
      );
      emailForm.reset({
        newEmail: '',
      });
    } catch (error) {
      emailForm.setError('root', {
        message: getApiErrorMessage(error, 'We could not start your email change.'),
      });
    }
  });

  return (
    <section className="stack">
      <section className="page-card stack">
        <div className="workspace-band-header">
          <div className="section-heading">
            <h2>Username</h2>
            <p className="page-description">
              Update the handle you use to sign in and identify this operator account.
            </p>
          </div>
          {profile ? (
            <p className="workspace-note">Current username: {profile.username}</p>
          ) : null}
        </div>

        <form className="stack" onSubmit={handleUsernameSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              autoComplete="username"
              maxLength={64}
              placeholder="demo"
              spellCheck={false}
              {...usernameForm.register('username')}
            />
            {usernameForm.formState.errors.username ? (
              <span className="field-error" role="alert">
                {usernameForm.formState.errors.username.message}
              </span>
            ) : null}
          </label>

          <button
            className="button button-primary form-action-button"
            disabled={usernameForm.formState.isSubmitting}
            type="submit"
          >
            {usernameForm.formState.isSubmitting ? 'Saving username…' : 'Save username'}
          </button>

          {usernameSuccessMessage ? (
            <p className="status-banner status-success" role="status">
              {usernameSuccessMessage}
            </p>
          ) : null}

          {usernameForm.formState.errors.root ? (
            <p className="status-banner status-error" role="alert">
              {usernameForm.formState.errors.root.message}
            </p>
          ) : null}
        </form>
      </section>

      <section className="page-card stack">
        <div className="workspace-band-header">
          <div className="section-heading">
            <h2>Email</h2>
            <p className="page-description">
              Start an email change and confirm it from the verification link sent to the new
              address.
            </p>
          </div>
          {profile ? <p className="workspace-note">Current email: {profile.email}</p> : null}
        </div>

        <form className="stack" onSubmit={handleEmailSubmit}>
          <label className="field">
            <span>New email</span>
            <input
              autoComplete="email"
              placeholder="name@example.com"
              spellCheck={false}
              type="email"
              {...emailForm.register('newEmail')}
            />
            {emailForm.formState.errors.newEmail ? (
              <span className="field-error" role="alert">
                {emailForm.formState.errors.newEmail.message}
              </span>
            ) : null}
          </label>

          <button
            className="button button-primary form-action-button"
            disabled={emailForm.formState.isSubmitting}
            type="submit"
          >
            {emailForm.formState.isSubmitting
              ? 'Requesting email change…'
              : 'Request email change'}
          </button>

          {emailSuccessMessage ? (
            <p className="status-banner status-success" role="status">
              {emailSuccessMessage}
            </p>
          ) : null}

          {emailForm.formState.errors.root ? (
            <p className="status-banner status-error" role="alert">
              {emailForm.formState.errors.root.message}
            </p>
          ) : null}
        </form>
      </section>
    </section>
  );
}
