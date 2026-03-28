/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../../shared/api/apiClient';
import { LoginForm } from './LoginForm';

const useLoginMutationMock = vi.fn();
const usePasskeyLoginMutationMock = vi.fn();
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
  useLoginMutation: () => useLoginMutationMock(),
}));

vi.mock('../../passkeys/hooks', () => ({
  usePasskeyLoginMutation: () => usePasskeyLoginMutationMock(),
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
    statusText: status === 401 ? 'Unauthorized' : 'Bad Request',
    url: buildApiUrl('/api/auth/login'),
    responseBody,
  });
}

function renderForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/profile" element={<h1>Profile landing</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
    useLoginMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    usePasskeyLoginMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a sign in with passkey action', () => {
    renderForm();

    expect(screen.getByRole('button', { name: 'Sign in with passkey' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('renders turnstile inline and submits login with a captcha token', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      authenticated: true,
      userId: 1,
      username: 'demo',
      email: 'demo@example.com',
      role: 'USER',
    });

    useLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();

    await user.type(screen.getByLabelText('Login'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'very-secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        usernameOrEmail: 'demo@example.com',
        password: 'very-secret',
        captchaToken: 'captcha-token',
      });
    });
  });

  it('starts the passkey login flow and navigates after success', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      authenticated: true,
      userId: 1,
      username: 'demo',
      email: 'demo@example.com',
      role: 'USER',
    });

    usePasskeyLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Sign in with passkey' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        captchaToken: 'captcha-token',
      });
    });

    expect(await screen.findByRole('heading', { name: 'Profile landing' })).toBeTruthy();
  });

  it('shows passkey-specific errors without breaking password login', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('Passkeys are not supported on this browser.'));

    usePasskeyLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.click(screen.getByRole('button', { name: 'Sign in with passkey' }));

    expect(
      await screen.findByText('Passkeys are not supported on this browser.')
    ).toBeTruthy();
    expect(
      screen.queryByText('Please try the verification again before submitting.')
    ).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('keeps the email-not-verified handling local to the login form', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(403, {
        error: 'Email is not verified.',
        code: 'EMAIL_NOT_VERIFIED',
      })
    );

    useLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.type(screen.getByLabelText('Login'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'very-secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText(
        'Your email is not verified yet. Confirm it from your inbox or request a new verification link.'
      )
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Open email verification' })).toBeTruthy();
  });

  it('shows the shared calm protection message for captcha failures', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(400, {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      })
    );

    useLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.type(screen.getByLabelText('Login'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'very-secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Please try the verification again before submitting.')
    ).toBeTruthy();
  });
});
