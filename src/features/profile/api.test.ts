import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl } from '../../shared/api/apiClient';
import {
  changeCurrentPassword,
  getCurrentProfile,
  requestCurrentEmailChange,
  updateCurrentUsername,
  verifyCurrentEmailChange,
} from './api';

describe('profile api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the authenticated profile with session credentials', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 1,
            userId: 1,
            username: 'demo',
            email: 'demo@example.com',
            role: 'USER',
            displayName: 'Demo User',
            bio: 'Session-backed example profile',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

    const result = await getCurrentProfile();

    expect(result).toMatchObject({
      id: 1,
      username: 'demo',
      displayName: 'Demo User',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me'));
    expect(init?.method).toBe('GET');
    expect(init?.credentials).toBe('include');
  });

  it('updates the current username with the profile endpoint contract', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 1,
            userId: 1,
            username: 'renamed-demo',
            email: 'demo@example.com',
            role: 'USER',
            displayName: 'Demo User',
            bio: 'Session-backed example profile',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

    const result = await updateCurrentUsername({ username: 'renamed-demo' });

    expect(result.username).toBe('renamed-demo');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/username'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ username: 'renamed-demo' }));
  });

  it('changes the current password with the profile endpoint contract', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ changed: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

    const result = await changeCurrentPassword({
      currentPassword: 'old-password',
      newPassword: 'new-password-123',
    });

    expect(result.changed).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/password'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(
      JSON.stringify({
        currentPassword: 'old-password',
        newPassword: 'new-password-123',
      })
    );
  });

  it('requests an email change with the profile endpoint contract', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ accepted: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

    const result = await requestCurrentEmailChange({
      newEmail: 'next@example.com',
    });

    expect(result.accepted).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/email/change-request'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ newEmail: 'next@example.com' }));
  });

  it('verifies an email change token with the profile endpoint contract', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 1,
            userId: 1,
            username: 'demo',
            email: 'next@example.com',
            role: 'USER',
            displayName: 'Demo User',
            bio: 'Session-backed example profile',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

    const result = await verifyCurrentEmailChange({ token: 'email-change-token' });

    expect(result.email).toBe('next@example.com');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/email/verify'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ token: 'email-change-token' }));
  });
});
