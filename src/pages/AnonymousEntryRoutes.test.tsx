/* @vitest-environment jsdom */

import { cleanup, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ForgotPasswordPage } from './forgot-password/ForgotPasswordPage';
import { HomePage } from './home/HomePage';
import { LoginPage } from './login/LoginPage';
import { RegisterPage } from './register/RegisterPage';
import { ResetPasswordPage } from './reset-password/ResetPasswordPage';
import * as authSessionModule from '../features/auth/session/useAuthSession';

const useLoginMutationMock = vi.fn();
const useRegisterMutationMock = vi.fn();
const useForgotPasswordMutationMock = vi.fn();
const useResetPasswordMutationMock = vi.fn();
const usePasskeyLoginMutationMock = vi.fn();

vi.mock('../features/auth/mutations', () => ({
  useLoginMutation: () => useLoginMutationMock(),
  useRegisterMutation: () => useRegisterMutationMock(),
  useForgotPasswordMutation: () => useForgotPasswordMutationMock(),
  useResetPasswordMutation: () => useResetPasswordMutationMock(),
}));

vi.mock('../features/passkeys/hooks', () => ({
  usePasskeyLoginMutation: () => usePasskeyLoginMutationMock(),
}));

function renderRoute(path: string, element: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path.split('?')[0]} element={element} />
      </Routes>
    </MemoryRouter>
  );
}

describe('anonymous entry routes', () => {
  beforeEach(() => {
    useLoginMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useRegisterMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useForgotPasswordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    useResetPasswordMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    usePasskeyLoginMutationMock.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the login route with operator guidance', () => {
    renderRoute('/login', <LoginPage />);

    expect(screen.getByText('Use your account details or a registered passkey.')).toBeTruthy();
    expect(screen.getByText('Password sign-in and passkey sign-in use the same operator account.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in with passkey' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Forgot password' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create account' })).toBeTruthy();
  });

  it('renders the register route with verification guidance', () => {
    renderRoute('/register', <RegisterPage />);

    expect(screen.getByText('Create an operator account and verify it before first access.')).toBeTruthy();
    expect(screen.getByText('Use an address you can verify now. Sign-in remains locked until email verification completes.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy();
  });

  it('renders the forgot-password route with recovery guidance', () => {
    renderRoute('/forgot-password', <ForgotPasswordPage />);

    expect(screen.getByText('Request a fresh password reset link for an existing account.')).toBeTruthy();
    expect(screen.getByText('Enter the account email exactly as registered. If the inbox stays quiet, check spam before sending another request.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toBeTruthy();
  });

  it('renders the reset-password route with link guidance', () => {
    renderRoute('/reset-password?token=reset-token', <ResetPasswordPage />);

    expect(screen.getByText('Set a new password and return to operator access.')).toBeTruthy();
    expect(screen.getByText('Use the link from your inbox. If it expires, request a fresh reset from sign in.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reset password' })).toBeTruthy();
  });

  it('renders the home route as a public entry surface for anonymous users', () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    renderRoute('/', <HomePage />);

    expect(screen.getByRole('heading', { name: 'Spring Playground' })).toBeTruthy();
    expect(
      screen.getByText('A calm place to explore account access, profile tools, and session flows.')
    ).toBeTruthy();

    const authContent = screen.getByRole('region', { name: 'Authentication content' });
    expect(within(authContent).getByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(within(authContent).getByRole('link', { name: 'Create account' })).toBeTruthy();
  });

  it('renders the home route loading state while the session is being checked', () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'loading',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    renderRoute('/', <HomePage />);

    expect(screen.getByRole('heading', { name: 'Checking session' })).toBeTruthy();
    expect(screen.getByText('Opening your account.')).toBeTruthy();
  });
});
