/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../features/auth/session/useAuthSession';
import { routes } from './router';

function renderRoute(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return { router };
}

describe('app routes', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('redirects anonymous visitors from the protected profile route to login', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/profile');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });

    expect(
      screen.getByRole('heading', { name: 'Sign in with your session account' })
    ).toBeTruthy();
  });

  it('redirects authenticated visitors away from auth-only routes', async () => {
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
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/login');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/profile');
    });

    expect(screen.getByText('Demo User')).toBeTruthy();
  });

  it('renders the reset-password route for anonymous visitors', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    renderRoute('/reset-password');

    expect(
      await screen.findByRole('heading', { name: 'Set a new password' })
    ).toBeTruthy();
  });

  it('renders the protected security settings route for authenticated users', async () => {
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
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/settings/security');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings/security');
    });

    expect(
      screen.getByRole('heading', { name: 'Security settings' })
    ).toBeTruthy();
  });

  it('keeps the verify-email route public', async () => {
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
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/verify-email');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/verify-email');
    });

    expect(
      screen.getByRole('heading', { name: 'Confirm your email address' })
    ).toBeTruthy();
  });
});
