/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
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

  it('redirects anonymous visitors from the root route to login', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
  });

  it('redirects authenticated visitors from the root route to profile', async () => {
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

    const { router } = renderRoute('/');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/profile');
    });

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
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

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeTruthy();
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

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  });

  it('shows a minimal anonymous header on auth routes', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    renderRoute('/register');

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    const utilityNav = screen.getByRole('navigation', { name: 'Utility' });

    expect(within(primaryNav).getByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(within(utilityNav).getByRole('link', { name: 'Create account' })).toBeTruthy();
    expect(within(primaryNav).queryByRole('link', { name: 'Profile' })).toBeNull();
    expect(within(utilityNav).queryByRole('button', { name: 'Sign out' })).toBeNull();
  });

  it('shows an authenticated header with account actions and a utility sign out action', async () => {
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

    renderRoute('/profile');

    const primaryNav = await screen.findByRole('navigation', { name: 'Primary' });
    const utilityNav = screen.getByRole('navigation', { name: 'Utility' });

    expect(within(primaryNav).getByRole('link', { name: 'Profile' })).toBeTruthy();
    expect(within(primaryNav).queryByRole('link', { name: 'Sign in' })).toBeNull();
    expect(within(utilityNav).getByRole('button', { name: 'Sign out' })).toBeTruthy();
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
      await screen.findByRole('heading', { name: 'Reset password' })
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

    expect(screen.getByRole('heading', { name: 'Security' })).toBeTruthy();
  });

  it('blocks protected routes when the session state cannot be verified', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'error',
      errorMessage: 'Expected a JSON API response from /api/profile/me.',
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/settings/security');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings/security');
    });

    expect(screen.getByRole('heading', { name: 'Session unavailable' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Security' })).toBeNull();
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

    expect(screen.getByRole('heading', { name: 'Verify email' })).toBeTruthy();
  });
});
