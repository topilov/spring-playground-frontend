/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../shared/api/apiClient';
import { VerifyEmailPage } from './VerifyEmailPage';

const verifyEmailMock = vi.fn();
const useResendVerificationEmailMutationMock = vi.fn();
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

vi.mock('../../features/auth/api', () => ({
  verifyEmail: (payload: { token: string }) => verifyEmailMock(payload),
}));

vi.mock('../../features/auth/mutations', () => ({
  useResendVerificationEmailMutation: () =>
    useResendVerificationEmailMutationMock(),
}));

vi.mock('../../shared/protection/turnstile/useTurnstileController', () => ({
  useTurnstileController: () => turnstileController,
}));

vi.mock('../../shared/protection/turnstile/TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget">Turnstile widget</div>,
}));

function buildApiError(status: number, responseBody: unknown) {
  return new ApiClientError({
    status,
    statusText: status === 429 ? 'Too Many Requests' : 'Bad Request',
    url: buildApiUrl('/api/auth/resend-verification-email'),
    responseBody,
  });
}

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    verifyEmailMock.mockReset();
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a token verification status while checking the link', () => {
    verifyEmailMock.mockImplementation(() => new Promise(() => undefined));

    renderPage('/verify-email?token=verify-token');

    expect(screen.getByText('Checking verification link…')).toBeTruthy();
    expect(
      screen.getByText('Complete the email check and return to sign-in when the link clears.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeTruthy();
  });

  it('shows a verified state after a successful token check', async () => {
    verifyEmailMock.mockResolvedValue({ verified: true });

    renderPage('/verify-email?token=verify-token');

    expect(
      await screen.findByText('Email verified. The account workspace is ready for sign-in.')
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
  });

  it('preserves plus signs in the token from the email link', async () => {
    verifyEmailMock.mockResolvedValue({ verified: true });

    renderPage('/verify-email?token=verify+token');

    await waitFor(() => {
      expect(verifyEmailMock).toHaveBeenCalledWith({ token: 'verify+token' });
    });
  });

  it('shows a failed state when verification does not succeed', async () => {
    verifyEmailMock.mockRejectedValue(new Error('Verification link expired.'));

    renderPage('/verify-email?token=verify-token');

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Verification link expired.'
    );
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeTruthy();
  });

  it('shows an idle state when no token is present', () => {
    renderPage('/verify-email');

    expect(
      screen.getByText('Open the email verification link, or request another one below.')
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Use the verification link from your inbox, or issue a fresh one from this screen.'
      )
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeTruthy();
  });

  it('renders turnstile inline and submits resend verification with a captcha token', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ accepted: true });

    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage('/verify-email?email=demo@example.com');

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      });
    });
  });

  it('shows a resend success message after requesting another verification email', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ sent: true });

    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage('/verify-email?email=demo@example.com');

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      });
    });

    expect(
      await screen.findByText('If that email is still unverified, a new link has been sent.')
    ).toBeTruthy();
    expect(
      screen.queryByText('Open the email verification link, or request another one below.')
    ).toBeNull();
  });

  it('shows a resend error message in the shared shell status area', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Mailbox unavailable.'));

    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage('/verify-email?email=demo@example.com');

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      });
    });

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Mailbox unavailable.');
    expect(alert.closest('form')).toBeNull();
  });

  it('keeps the generic accepted UX after resend requests', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ accepted: true });

    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage('/verify-email?email=demo@example.com');

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    expect(
      await screen.findByText('If that email is still unverified, a new link has been sent.')
    ).toBeTruthy();
  });

  it('shows the shared calm protection message for resend protection failures', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(400, {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      })
    );

    useResendVerificationEmailMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage('/verify-email?email=demo@example.com');

    await user.click(screen.getByRole('button', { name: 'Resend verification email' }));

    expect(
      await screen.findByText('Please try the verification again before submitting.')
    ).toBeTruthy();
  });
});
