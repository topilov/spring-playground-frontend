/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as authSessionModule from '../features/auth/session/useAuthSession';
import { routes } from './router';
import { AuthPageShell } from '../shared/ui/AuthPageShell';
import { PageHeader } from '../shared/ui/PageHeader';

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

function getRoleNames(container: HTMLElement, role: 'link' | 'button') {
  return within(container)
    .queryAllByRole(role)
    .map((element) => element.textContent ?? '');
}

describe('app routes', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the public home surface for anonymous visitors on the root route', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'anonymous',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/');

    await screen.findByRole('heading', { name: 'Spring Playground' });

    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.getByText(
        'Identity workspace for profile access, sign-in checks, and account recovery.'
      )
    ).toBeTruthy();
    expect(screen.getByText('Passkeys')).toBeTruthy();
    expect(screen.getByText('Two-factor')).toBeTruthy();
    expect(screen.getByText('Telegram')).toBeTruthy();

    const authContent = screen.getByRole('region', { name: 'Authentication content' });
    expect(within(authContent).getByRole('link', { name: 'Sign in' })).toBeTruthy();
    expect(within(authContent).getByRole('link', { name: 'Create account' })).toBeTruthy();
    expect(within(authContent).getByRole('link', { name: 'Recover account' })).toBeTruthy();
  });

  it('preserves the loading state on the root route while session status is pending', async () => {
    vi.spyOn(authSessionModule, 'useAuthSession').mockReturnValue({
      status: 'loading',
      errorMessage: null,
      isAuthenticated: false,
      profile: null,
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/');

    await screen.findByRole('heading', { name: 'Checking session' });

    expect(router.state.location.pathname).toBe('/');
    expect(screen.getByText('Loading your workspace entry.')).toBeTruthy();
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
    expect(screen.getByRole('status', { name: 'Session context' }).textContent).toContain(
      'Demo User'
    );
  });

  it('preserves long session context labels without dropping the full name', async () => {
    const longDisplayName =
      'Operator Display Name For The Signal Room Session Context Header Pill';

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
        displayName: longDisplayName,
        bio: 'Hello',
      },
      refreshSession: vi.fn(async () => null),
    });

    const { router } = renderRoute('/');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/profile');
    });

    expect(screen.getByRole('status', { name: 'Session context' }).getAttribute('title')).toBe(
      `Signed in as ${longDisplayName}`
    );
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

    expect(getRoleNames(primaryNav, 'link')).toEqual(['Sign in']);
    expect(getRoleNames(primaryNav, 'button')).toEqual([]);
    expect(getRoleNames(utilityNav, 'link')).toEqual(['Create account']);
    expect(getRoleNames(utilityNav, 'button')).toEqual([]);
    expect(screen.queryByRole('navigation', { name: 'Workspace' })).toBeNull();
  });

  it('shows the authenticated shell with persistent workspace navigation and a utility sign out action', async () => {
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

    await screen.findByRole('navigation', { name: 'Workspace' });

    const workspaceNav = screen.getByRole('navigation', { name: 'Workspace' });
    const utilityNav = screen.getByRole('navigation', { name: 'Utility' });

    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
    expect(getRoleNames(workspaceNav, 'link')).toEqual([
      'Profile',
      'Account',
      'Security',
      'Telegram',
    ]);
    expect(getRoleNames(workspaceNav, 'button')).toEqual([]);
    expect(getRoleNames(utilityNav, 'link')).toEqual([]);
    expect(getRoleNames(utilityNav, 'button')).toEqual(['Sign out']);
  });

  it('keeps settings routes in the workspace sidebar without rendering a second settings navigation', async () => {
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

    renderRoute('/settings/account');

    await screen.findByRole('heading', { name: 'Account' });

    const workspaceNav = screen.getByRole('navigation', { name: 'Workspace' });
    expect(screen.queryByRole('navigation', { name: 'Settings sections' })).toBeNull();
    expect(
      within(workspaceNav).getByRole('link', { name: 'Account' }).getAttribute('aria-current')
    ).toBe(
      'page'
    );
    expect(screen.getByRole('heading', { name: 'Username' })).toBeTruthy();
  });

  it('keeps authenticated shell navigation on verify-email-change for signed-in users', async () => {
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

    const { router } = renderRoute('/verify-email-change');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/verify-email-change');
    });

    const workspaceNav = await screen.findByRole('navigation', { name: 'Workspace' });
    const utilityNav = screen.getByRole('navigation', { name: 'Utility' });

    expect(screen.queryByRole('navigation', { name: 'Primary' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Verify email change' })).toBeTruthy();
    expect(getRoleNames(workspaceNav, 'link')).toEqual([
      'Profile',
      'Account',
      'Security',
      'Telegram',
    ]);
    expect(getRoleNames(utilityNav, 'button')).toEqual(['Sign out']);
  });

  it('renders the account settings route inside the shared workspace navigation', async () => {
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

    renderRoute('/settings/account');

    const workspaceNav = await screen.findByRole('navigation', { name: 'Workspace' });

    expect(await screen.findByRole('heading', { name: 'Account' })).toBeTruthy();
    expect(within(workspaceNav).getByRole('link', { name: 'Account' }).getAttribute('href')).toBe(
      '/settings/account'
    );
    expect(within(workspaceNav).getByRole('link', { name: 'Security' }).getAttribute('href')).toBe(
      '/settings/security'
    );
    expect(within(workspaceNav).getByRole('link', { name: 'Telegram' }).getAttribute('href')).toBe(
      '/settings/telegram'
    );
  });

  it('renders the auth shell utility slot without disturbing content or footer composition', () => {
    render(
      <AuthPageShell
        footer={<a href="/help">Need help?</a>}
        subtitle="Use the utility action for secondary help."
        title="Sign in"
        utility={<button type="button">Use passkey</button>}
      >
        <p>Primary content</p>
      </AuthPageShell>
    );

    const authIntro = screen.getByRole('region', { name: 'Sign in' });
    const authContent = screen.getByRole('region', { name: 'Authentication content' });
    const supportRail = screen.getByLabelText('Sign in support');

    expect(within(authIntro).getByRole('heading', { name: 'Sign in' })).toBeTruthy();
    expect(within(authIntro).getByText('Use the utility action for secondary help.')).toBeTruthy();
    expect(authIntro.parentElement).toBe(authContent.parentElement);
    expect(supportRail.tagName).toBe('ASIDE');
    expect(supportRail.getAttribute('aria-live')).toBeNull();
    expect(screen.getByRole('button', { name: 'Use passkey' })).toBeTruthy();
    expect(within(authContent).getByText('Primary content')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Need help?' })).toBeTruthy();
  });

  it('renders page header status and actions as named groups', () => {
    render(
      <PageHeader
        actions={<button type="button">Refresh</button>}
        description="Manage sign-in methods and account access posture."
        status={<p role="status">Passkey and two-factor changes apply immediately.</p>}
        title="Security"
      />
    );

    const statusGroup = screen.getByRole('group', { name: 'Security status' });
    const actionsGroup = screen.getByRole('group', { name: 'Security actions' });

    expect(within(statusGroup).getByRole('status')).toBeTruthy();
    expect(within(actionsGroup).getByRole('button', { name: 'Refresh' })).toBeTruthy();
  });

  it('collapses the auth shell cleanly when no primary content is present', () => {
    render(<AuthPageShell subtitle="Loading your account details." title="Profile" />);

    const authIntro = screen.getByRole('region', { name: 'Profile' });

    expect(within(authIntro).getByText('Loading your account details.')).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Authentication content' })).toBeNull();
    expect(authIntro.parentElement?.className).toContain('auth-layout-solo');
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
    expect(screen.getByRole('group', { name: 'Security status' })).toBeTruthy();
    expect(
      screen.getByText(
        'Passwords, verification methods, and device trust for the current account.'
      )
    ).toBeTruthy();
  });

  it('renders the protected telegram settings route for authenticated users', async () => {
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

    const { router } = renderRoute('/settings/telegram');

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/settings/telegram');
    });

    expect(screen.getByRole('heading', { name: 'Telegram' })).toBeTruthy();
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
