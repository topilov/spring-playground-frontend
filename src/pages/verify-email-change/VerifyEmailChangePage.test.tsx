/* @vitest-environment jsdom */

import { StrictMode } from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../../features/auth/session/useAuthSession';
import { VerifyEmailChangePage } from './VerifyEmailChangePage';

const verifyCurrentEmailChangeMock = vi.fn();

vi.mock('../../features/profile/api', () => ({
  verifyCurrentEmailChange: (payload: { token: string }) =>
    verifyCurrentEmailChangeMock(payload),
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

function renderPageInStrictMode(path: string) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />
        </Routes>
      </MemoryRouter>
    </StrictMode>
  );
}

describe('VerifyEmailChangePage', () => {
  const refreshSession = vi.fn(async () => null);

  beforeEach(() => {
    verifyCurrentEmailChangeMock.mockReset();
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

  it('shows a token verification status while checking the link', () => {
    verifyCurrentEmailChangeMock.mockImplementation(() => new Promise(() => undefined));

    renderPage('/verify-email-change?token=email-change-token-pending');

    expect(screen.getByText('Checking your email change link...')).toBeTruthy();
    expect(
      screen.getByText('Finish the email change confirmation from the one-time link.')
    ).toBeTruthy();
  });

  it('shows a verified state and refreshes the session after success', async () => {
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

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });
    expect(
      await screen.findByText('Email change verified. Your account email is now updated.')
    ).toBeTruthy();
  });

  it('verifies the token only once in StrictMode', async () => {
    verifyCurrentEmailChangeMock.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'demo',
      email: 'next@example.com',
      role: 'USER',
      displayName: 'Demo User',
      bio: 'Hello',
    });

    renderPageInStrictMode('/verify-email-change?token=email-change-token-strict');

    await screen.findByText('Email change verified. Your account email is now updated.');

    expect(verifyCurrentEmailChangeMock).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it('does not restart verification when refreshSession changes identity on rerender', async () => {
    const refreshSessionSpy = vi.fn(async () => null);

    vi.spyOn(authSessionModule, 'useAuthSession').mockImplementation(() => ({
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
      refreshSession: async () => refreshSessionSpy(),
    }));

    verifyCurrentEmailChangeMock.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'demo',
      email: 'next@example.com',
      role: 'USER',
      displayName: 'Demo User',
      bio: 'Hello',
    });

    renderPage('/verify-email-change?token=email-change-token-rerender');

    await screen.findByText('Email change verified. Your account email is now updated.');

    expect(verifyCurrentEmailChangeMock).toHaveBeenCalledTimes(1);
    expect(refreshSessionSpy).toHaveBeenCalledTimes(1);
  });

  it('preserves plus signs in the token from the email link', async () => {
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

    await waitFor(() => {
      expect(verifyCurrentEmailChangeMock).toHaveBeenCalledWith({
        token: 'email+change+token',
      });
    });
  });

  it('shows a failed state when verification does not succeed', async () => {
    verifyCurrentEmailChangeMock.mockRejectedValue(new Error('Email change token expired.'));

    renderPage('/verify-email-change?token=email-change-token-failed');

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
  });
});
