/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ResetPasswordForm } from './ResetPasswordForm';
import { ResetPasswordPage } from '../../../pages/reset-password/ResetPasswordPage';

const useResetPasswordMutationMock = vi.fn();

vi.mock('../mutations', () => ({
  useResetPasswordMutation: () => useResetPasswordMutationMock(),
}));

function renderForm(token: string | null) {
  return render(
    <MemoryRouter>
      <ResetPasswordForm token={token} />
    </MemoryRouter>
  );
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows an invalid-link state when the token is missing', () => {
    renderForm(null);

    expect(
      screen.getByText('This reset link is invalid or incomplete.')
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeTruthy();
  });

  it('keeps the reset action and route guidance visible in the shell', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=reset-token']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Set a new password and return to operator access.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeTruthy();
    expect(screen.getByText('Use the link from your inbox. If it expires, request a fresh reset from sign in.')).toBeTruthy();
  });

  it('blocks submit when the confirmation password does not match', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn();

    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm('reset-token');

    await user.type(screen.getByLabelText('New password'), 'new-very-secret');
    await user.type(screen.getByLabelText('Confirm new password'), 'different-secret');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText('Passwords must match.')
    ).toBeTruthy();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('shows a success state after a successful reset', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ reset: true });

    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm('reset-token');

    await user.type(screen.getByLabelText('New password'), 'new-very-secret');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-very-secret');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        token: 'reset-token',
        newPassword: 'new-very-secret',
      });
    });

    expect(
      await screen.findByText('Password updated.')
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeTruthy();
  });
});
