/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../../features/auth/session/useAuthSession';
import { ProfilePage } from './ProfilePage';

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  const refreshSession = vi.fn(async () => null);

  beforeEach(() => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'authenticated',
      errorMessage: null,
      isAuthenticated: true,
      profile: {
        id: 7,
        userId: 11,
        username: 'signal-room',
        email: 'signal-room@example.com',
        role: 'USER',
        displayName: 'Signal Room Operator',
        bio: 'Keeps the workspace in sync.',
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

  it('renders authenticated profile details and refresh action', () => {
    renderProfilePage();

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
    expect(
      screen.getByText('Reference view for the signed-in identity and account record.')
    ).toBeTruthy();
    expect(screen.getAllByText('Signal Room Operator').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('signal-room')).toBeTruthy();
    expect(screen.getByText('signal-room@example.com')).toBeTruthy();
    expect(screen.getByText('Keeps the workspace in sync.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Account information' })).toBeTruthy();
  });

  it('shows the loading shell while the session is pending', () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'loading',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession,
    });

    renderProfilePage();

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
    expect(
      screen.getByText('Load the current operator profile before editing account details.')
    ).toBeTruthy();
    expect(
      screen.getByText('Pulling the latest account record from the active session.')
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull();
  });

  it('shows the refresh error state when a retry fails', async () => {
    const user = userEvent.setup();

    refreshSession.mockRejectedValueOnce(new Error('Refresh failed right now.'));

    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'error',
      errorMessage: 'Session refresh is unavailable.',
      isAuthenticated: false,
      profile: null,
      refreshSession,
    });

    renderProfilePage();

    expect(screen.getByRole('alert').textContent).toContain(
      'Session refresh is unavailable.'
    );

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    await waitFor(() => {
      expect(refreshSession).toHaveBeenCalledTimes(1);
    });
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Refresh failed right now.'
    );
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
  });

  it('shows the anonymous fallback with a sign-in action', () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession,
    });

    renderProfilePage();

    expect(
      screen.getByText('Protected account details stay behind operator sign-in.')
    ).toBeTruthy();
    expect(
      screen.getByText(
        'Return to sign in, then reopen the profile workspace from the active session.'
      )
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/login');
    expect(screen.queryByRole('button', { name: 'Refresh' })).toBeNull();
  });
});
