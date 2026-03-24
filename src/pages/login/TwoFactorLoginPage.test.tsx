/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../shared/api/apiClient';
import { TwoFactorLoginPage } from './TwoFactorLoginPage';

const useVerifyTwoFactorLoginMutationMock = vi.fn();
const useVerifyTwoFactorBackupCodeMutationMock = vi.fn();
const loadPendingTwoFactorLoginChallengeMock = vi.fn();
const clearPendingTwoFactorLoginChallengeMock = vi.fn();

vi.mock('../../features/two-factor/hooks', () => ({
  useVerifyTwoFactorLoginMutation: () => useVerifyTwoFactorLoginMutationMock(),
  useVerifyTwoFactorBackupCodeMutation: () =>
    useVerifyTwoFactorBackupCodeMutationMock(),
}));

vi.mock('../../features/two-factor/challengeStorage', () => ({
  loadPendingTwoFactorLoginChallenge: () =>
    loadPendingTwoFactorLoginChallengeMock(),
  clearPendingTwoFactorLoginChallenge: () =>
    clearPendingTwoFactorLoginChallengeMock(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login/2fa']}>
      <Routes>
        <Route path="/login" element={<h1>Sign in</h1>} />
        <Route path="/profile" element={<h1>Profile landing</h1>} />
        <Route path="/login/2fa" element={<TwoFactorLoginPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('TwoFactorLoginPage', () => {
  beforeEach(() => {
    loadPendingTwoFactorLoginChallengeMock.mockReturnValue({
      loginChallengeId: 'login-challenge-id',
      methods: ['TOTP', 'BACKUP_CODE'],
      expiresAt: '2026-03-24T10:15:30Z',
      redirectTo: '/profile',
    });
    useVerifyTwoFactorLoginMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useVerifyTwoFactorBackupCodeMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('redirects back to sign in when no pending challenge is available', async () => {
    loadPendingTwoFactorLoginChallengeMock.mockReturnValue(null);

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(clearPendingTwoFactorLoginChallengeMock).toHaveBeenCalled();
  });

  it('submits a totp code and continues to the authenticated route', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      authenticated: true,
      userId: 1,
      username: 'demo',
      email: 'demo@example.com',
      role: 'USER',
    });

    useVerifyTwoFactorLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage();

    await user.type(screen.getByLabelText('Authenticator code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        loginChallengeId: 'login-challenge-id',
        code: '123456',
      });
    });

    expect(await screen.findByRole('heading', { name: 'Profile landing' })).toBeTruthy();
    expect(clearPendingTwoFactorLoginChallengeMock).toHaveBeenCalled();
  });

  it('supports backup-code verification when the challenge allows it', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      authenticated: true,
      userId: 1,
      username: 'demo',
      email: 'demo@example.com',
      role: 'USER',
    });

    useVerifyTwoFactorBackupCodeMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage();

    await user.click(screen.getByRole('button', { name: 'Use backup code' }));
    await user.type(screen.getByLabelText('Backup code'), 'ABCD-EFGH-JKLM');
    await user.click(screen.getByRole('button', { name: 'Verify backup code' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        loginChallengeId: 'login-challenge-id',
        backupCode: 'ABCD-EFGH-JKLM',
      });
    });
  });

  it('redirects back to sign in when the challenge is invalid or expired', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      new ApiClientError({
        status: 400,
        statusText: 'Bad Request',
        url: buildApiUrl('/api/auth/2fa/login/verify'),
        responseBody: {
          error: 'Login challenge expired.',
        },
      })
    );

    useVerifyTwoFactorLoginMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderPage();

    await user.type(screen.getByLabelText('Authenticator code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify code' }));

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(clearPendingTwoFactorLoginChallengeMock).toHaveBeenCalled();
  });
});
