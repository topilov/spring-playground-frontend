/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../../auth/session/useAuthSession';
import { AccountSettingsSection } from './AccountSettingsSection';

const updateCurrentUsernameMock = vi.fn();
const requestCurrentEmailChangeMock = vi.fn();

vi.mock('../api', () => ({
  updateCurrentUsername: (payload: { username: string }) =>
    updateCurrentUsernameMock(payload),
  requestCurrentEmailChange: (payload: { newEmail: string }) =>
    requestCurrentEmailChangeMock(payload),
}));

describe('AccountSettingsSection', () => {
  const refreshSession = vi.fn(async () => null);

  beforeEach(() => {
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
    updateCurrentUsernameMock.mockReset();
    requestCurrentEmailChangeMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    refreshSession.mockReset();
    refreshSession.mockImplementation(async () => null);
  });

  it('saves a trimmed username and refreshes the session', async () => {
    const user = userEvent.setup();

    updateCurrentUsernameMock.mockResolvedValue({
      id: 1,
      userId: 1,
      username: 'renamed-demo',
      email: 'demo@example.com',
      role: 'USER',
      displayName: 'Demo User',
      bio: 'Hello',
    });

    render(<AccountSettingsSection />);

    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Username'), '  renamed-demo  ');
    await user.click(screen.getByRole('button', { name: 'Save username' }));

    await waitFor(() => {
      expect(updateCurrentUsernameMock).toHaveBeenCalledWith({
        username: 'renamed-demo',
      });
    });
    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Username updated.')).toBeTruthy();
  });

  it('shows a username api error in the shared status area', async () => {
    const user = userEvent.setup();

    updateCurrentUsernameMock.mockRejectedValue(new Error('Username already in use.'));

    render(<AccountSettingsSection />);

    await user.click(screen.getByRole('button', { name: 'Save username' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Username already in use.'
    );
  });

  it('requests an email change and clears the field after success', async () => {
    const user = userEvent.setup();

    requestCurrentEmailChangeMock.mockResolvedValue({
      accepted: true,
    });

    render(<AccountSettingsSection />);

    await user.type(screen.getByLabelText('New email'), 'next@example.com');
    await user.click(screen.getByRole('button', { name: 'Request email change' }));

    await waitFor(() => {
      expect(requestCurrentEmailChangeMock).toHaveBeenCalledWith({
        newEmail: 'next@example.com',
      });
    });

    expect(
      await screen.findByText(
        'Email change requested. Check the new address for a verification link.'
      )
    ).toBeTruthy();
    expect((screen.getByLabelText('New email') as HTMLInputElement).value).toBe('');
  });
});
