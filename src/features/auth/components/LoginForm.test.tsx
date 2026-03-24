/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LoginForm } from './LoginForm';

const useLoginMutationMock = vi.fn();
const usePasskeyLoginMutationMock = vi.fn();

vi.mock('../mutations', () => ({
  useLoginMutation: () => useLoginMutationMock(),
}));

vi.mock('../../passkeys/hooks', () => ({
  usePasskeyLoginMutation: () => usePasskeyLoginMutationMock(),
}));

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
      expect(mutateAsync).toHaveBeenCalledWith({});
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
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });
});
