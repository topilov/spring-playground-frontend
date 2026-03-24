/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../../shared/api/apiClient';
import { ResetPasswordForm } from './ResetPasswordForm';

const useResetPasswordMutationMock = vi.fn();
const turnstileController = {
  acquireToken: vi.fn(),
  reset: vi.fn(),
  isReady: true,
  attach: vi.fn(),
  detach: vi.fn(),
  handleError: vi.fn(),
  handleExpired: vi.fn(),
  handleToken: vi.fn(),
};

vi.mock('../mutations', () => ({
  useResetPasswordMutation: () => useResetPasswordMutationMock(),
}));

vi.mock('../../../shared/protection/turnstile/useTurnstileController', () => ({
  useTurnstileController: () => turnstileController,
}));

vi.mock('../../../shared/protection/turnstile/TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget">Turnstile widget</div>,
}));

function buildApiError(status: number, responseBody: unknown) {
  return new ApiClientError({
    status,
    statusText: status === 400 ? 'Bad Request' : 'Unauthorized',
    url: buildApiUrl('/api/auth/reset-password'),
    responseBody,
  });
}

function renderForm(token: string | null) {
  return render(
    <MemoryRouter>
      <ResetPasswordForm token={token} />
    </MemoryRouter>
  );
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
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

  it('renders turnstile inline and submits reset requests with a captcha token', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ reset: true });

    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm('reset-token');

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();

    await user.type(screen.getByLabelText('New password'), 'new-very-secret');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-very-secret');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        token: 'reset-token',
        newPassword: 'new-very-secret',
        captchaToken: 'captcha-token',
      });
    });
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
        captchaToken: 'captcha-token',
      });
    });

    expect(
      await screen.findByText('Password updated.')
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeTruthy();
  });

  it('keeps invalid token business errors local to the reset form', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(400, {
        error: 'This reset link is invalid or expired.',
        code: 'RESET_TOKEN_INVALID',
      })
    );

    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm('reset-token');

    await user.type(screen.getByLabelText('New password'), 'new-very-secret');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-very-secret');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText('This reset link is invalid or expired.')
    ).toBeTruthy();
  });

  it('shows the shared calm protection message for captcha failures', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(400, {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      })
    );

    useResetPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm('reset-token');

    await user.type(screen.getByLabelText('New password'), 'new-very-secret');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-very-secret');
    await user.click(screen.getByRole('button', { name: 'Reset password' }));

    expect(
      await screen.findByText('Please try the verification again before submitting.')
    ).toBeTruthy();
  });
});
