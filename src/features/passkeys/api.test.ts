import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl } from '../../shared/api/apiClient';
import {
  deletePasskey,
  finishPasskeyLogin,
  finishPasskeyRegistration,
  listPasskeys,
  renamePasskey,
  startPasskeyLogin,
  startPasskeyRegistration,
} from './api';

describe('passkeys api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the authenticated user passkeys', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 10,
            name: 'Work Laptop',
            createdAt: '2026-03-21T10:15:30Z',
            lastUsedAt: '2026-03-21T12:05:00Z',
            deviceHint: 'platform',
            transports: ['internal'],
          },
        ]),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await listPasskeys();

    expect(result).toEqual([
      {
        id: 10,
        name: 'Work Laptop',
        createdAt: '2026-03-21T10:15:30Z',
        lastUsedAt: '2026-03-21T12:05:00Z',
        deviceHint: 'platform',
        transports: ['internal'],
      },
    ]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkeys'));
    expect(init?.method).toBe('GET');
    expect(init?.credentials).toBe('include');
  });

  it('treats an empty passkey list response as no passkeys', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    await expect(listPasskeys()).resolves.toEqual([]);
  });

  it('starts authenticated passkey registration', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ceremonyId: 'registration-ceremony',
          publicKey: {
            challenge: 'challenge-value',
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await startPasskeyRegistration({
      nickname: 'Work Laptop',
    });

    expect(result).toEqual({
      ceremonyId: 'registration-ceremony',
      publicKey: {
        challenge: 'challenge-value',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkeys/register/options'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ nickname: 'Work Laptop' }));
  });

  it('verifies authenticated passkey registration', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 10,
          name: 'Work Laptop',
          createdAt: '2026-03-21T10:15:30Z',
          deviceHint: 'platform',
          transports: ['internal'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await finishPasskeyRegistration({
      ceremonyId: 'registration-ceremony',
      credential: {
        id: 'credential-id',
      },
      nickname: 'Work Laptop',
    });

    expect(result).toEqual({
      id: 10,
      name: 'Work Laptop',
      createdAt: '2026-03-21T10:15:30Z',
      lastUsedAt: null,
      deviceHint: 'platform',
      transports: ['internal'],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkeys/register/verify'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        ceremonyId: 'registration-ceremony',
        credential: {
          id: 'credential-id',
        },
        nickname: 'Work Laptop',
      })
    );
  });

  it('renames a passkey', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 10,
          name: 'Desk Mac',
          createdAt: '2026-03-21T10:15:30Z',
          deviceHint: 'platform',
          transports: ['internal'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await renamePasskey({
      id: 10,
      name: 'Desk Mac',
    });

    expect(result).toMatchObject({
      id: 10,
      name: 'Desk Mac',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkeys/10'));
    expect(init?.method).toBe('PATCH');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ name: 'Desk Mac' }));
  });

  it('deletes a passkey', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await deletePasskey(10);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkeys/10'));
    expect(init?.method).toBe('DELETE');
    expect(init?.credentials).toBe('include');
  });

  it('starts unauthenticated passkey login', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          ceremonyId: 'login-ceremony',
          publicKey: {
            challenge: 'challenge-value',
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await startPasskeyLogin({
      usernameOrEmail: 'demo@example.com',
    });

    expect(result).toEqual({
      ceremonyId: 'login-ceremony',
      publicKey: {
        challenge: 'challenge-value',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkey-login/options'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ usernameOrEmail: 'demo@example.com' }));
  });

  it('verifies passkey login and returns the normal session user', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          authenticated: true,
          userId: 1,
          username: 'demo',
          email: 'demo@example.com',
          role: 'USER',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await finishPasskeyLogin({
      ceremonyId: 'login-ceremony',
      credential: {
        id: 'credential-id',
      },
    });

    expect(result).toMatchObject({
      authenticated: true,
      username: 'demo',
      email: 'demo@example.com',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/passkey-login/verify'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        ceremonyId: 'login-ceremony',
        credential: {
          id: 'credential-id',
        },
      })
    );
  });
});
