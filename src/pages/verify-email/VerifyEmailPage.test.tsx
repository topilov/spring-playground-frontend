/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VerifyEmailPage } from './VerifyEmailPage';

const verifyEmailMock = vi.fn();
const useResendVerificationEmailMutationMock = vi.fn();

vi.mock('../../features/auth/api', () => ({
  verifyEmail: (payload: { token: string }) => verifyEmailMock(payload),
}));

vi.mock('../../features/auth/mutations', () => ({
  useResendVerificationEmailMutation: () =>
    useResendVerificationEmailMutationMock(),
}));

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

    expect(screen.getByText('Checking your verification link...')).toBeTruthy();
    expect(
      screen.getByText('Finish the link check, then recover operator access if needed.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeTruthy();
  });

  it('shows a verified state after a successful token check', async () => {
    verifyEmailMock.mockResolvedValue({ verified: true });

    renderPage('/verify-email?token=verify-token');

    expect(
      await screen.findByText('Email verified. Operator access is ready for sign-in.')
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
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

    expect(screen.getByText('Open the email link, or request a new one below.')).toBeTruthy();
    expect(
      screen.getByText('Use the original verification link or dispatch another one from here.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeTruthy();
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
      expect(mutateAsync).toHaveBeenCalledWith({ email: 'demo@example.com' });
    });

    expect(
      await screen.findByText('If that email is still unverified, a new link has been sent.')
    ).toBeTruthy();
    expect(
      screen.queryByText('Open the email link, or request a new one below.')
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
      expect(mutateAsync).toHaveBeenCalledWith({ email: 'demo@example.com' });
    });

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Mailbox unavailable.');
    expect(alert.closest('form')).toBeNull();
  });
});
