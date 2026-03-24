/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../../features/auth/session/useAuthSession';
import { ApiClientError, buildApiUrl } from '../../shared/api/apiClient';
import { VerifyEmailChangePage } from './VerifyEmailChangePage';

const verifyCurrentEmailChangeMock = vi.fn();
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

vi.mock('../../features/profile/api', () => ({
  verifyCurrentEmailChange: (payload: { token: string; captchaToken: string }) =>
    verifyCurrentEmailChangeMock(payload),
}));

vi.mock('../../shared/protection/turnstile/useTurnstileController', () => ({
  useTurnstileController: () => turnstileController,
}));

vi.mock('../../shared/protection/turnstile/TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget">Turnstile widget</div>,
}));

function renderPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VerifyEmailChangePage', () => {
  const refreshSession = vi.fn(async () => null);

  beforeEach(() => {
    verifyCurrentEmailChangeMock.mockReset();
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'authenticated',
      errorMessage: null,
      isAuthenticated: true,
      profile: {
        id: 1,
        userId: 1,
        username: 'demo',
        email: 'demo@example.com',
        role: 'USER',
        displayName: 'Demo User',
        bio: 'Hello',
      },
      refreshSession,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    refreshSession.mockReset();
    refreshSession.mockImplementation(async () => null);
  });

  it('renders the inline turnstile and verify action when the token is present', () => {
    renderPage('/verify-email-change?token=email-change-token');

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Verify email change' })).toBeTruthy();
    expect(
      screen.getByText('Finish the email change confirmation from the one-time link.')
    ).toBeTruthy();
  });

  it('verifies the token after explicit confirmation and refreshes the session', async () => {
    const user = userEvent.setup();

    verifyCurrentEmailChangeMock.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'demo',
      email: 'next@example.com',
      role: 'USER',
      displayName: 'Demo User',
      bio: 'Hello',
    });

    renderPage('/verify-email-change?token=email-change-token-success');

    await user.click(screen.getByRole('button', { name: 'Verify email change' }));

    await waitFor(() => {
      expect(verifyCurrentEmailChangeMock).toHaveBeenCalledWith({
        token: 'email-change-token-success',
        captchaToken: 'captcha-token',
      });
    });
    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText('Email change verified. Your account email is now updated.')
    ).toBeTruthy();
  });

  it('preserves plus signs in the token from the email link', async () => {
    const user = userEvent.setup();

    verifyCurrentEmailChangeMock.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'demo',
      email: 'next@example.com',
      role: 'USER',
      displayName: 'Demo User',
      bio: 'Hello',
    });

    renderPage('/verify-email-change?token=email+change+token');

    await user.click(screen.getByRole('button', { name: 'Verify email change' }));

    await waitFor(() => {
      expect(verifyCurrentEmailChangeMock).toHaveBeenCalledWith({
        token: 'email+change+token',
        captchaToken: 'captcha-token',
      });
    });
  });

  it('shows a shared protection message for captcha failures', async () => {
    const user = userEvent.setup();

    verifyCurrentEmailChangeMock.mockRejectedValue(
      new ApiClientError({
        status: 400,
        statusText: 'Bad Request',
        url: buildApiUrl('/api/profile/me/email/verify'),
        responseBody: {
          error: 'Captcha validation failed.',
          code: 'CAPTCHA_INVALID',
        },
      })
    );

    renderPage('/verify-email-change?token=email-change-token-failed');

    await user.click(screen.getByRole('button', { name: 'Verify email change' }));

    expect(
      await screen.findByText('Please try the verification again before submitting.')
    ).toBeTruthy();
  });

  it('shows a failed state when verification does not succeed for non-protection errors', async () => {
    const user = userEvent.setup();

    verifyCurrentEmailChangeMock.mockRejectedValue(new Error('Email change token expired.'));

    renderPage('/verify-email-change?token=email-change-token-failed');

    await user.click(screen.getByRole('button', { name: 'Verify email change' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Email change token expired.'
    );
  });

  it('shows an idle state when no token is present', () => {
    renderPage('/verify-email-change');

    expect(screen.getByText('This verification link is missing or incomplete.')).toBeTruthy();
    expect(
      screen.getByText(
        'Open the email-change link from your new inbox to complete the update.'
      )
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Verify email change' })).toBeNull();
  });
});
