import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl } from '../../shared/api/apiClient';
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  register,
  resendVerificationEmail,
  verifyEmail,
} from './api';

describe('auth api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits the register contract to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            userId: 2,
            username: 'new-user',
            email: 'new-user@example.com',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      );

    const result = await register({
      username: 'new-user',
      email: 'new-user@example.com',
      password: 'very-secret-password',
      captchaToken: 'captcha-token',
    });

    expect(result).toEqual({
      userId: 2,
      username: 'new-user',
      email: 'new-user@example.com',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/register'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        username: 'new-user',
        email: 'new-user@example.com',
        password: 'very-secret-password',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('submits forgot-password requests to the backend', async () => {
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

    const result = await forgotPassword({
      email: 'demo@example.com',
      captchaToken: 'captcha-token',
    });

    expect(result).toEqual({ accepted: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/forgot-password'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('submits reset-password requests to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ reset: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

    const result = await resetPassword({
      token: 'reset-token',
      newPassword: 'new-very-secret-password',
      captchaToken: 'captcha-token',
    });

    expect(result).toEqual({ reset: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/reset-password'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        token: 'reset-token',
        newPassword: 'new-very-secret-password',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('submits verify-email requests to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ verified: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

    const result = await verifyEmail({
      token: 'verification-token',
    });

    expect(result).toEqual({ verified: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/verify-email'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ token: 'verification-token' }));
  });

  it('submits resend-verification-email requests to the backend', async () => {
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

    const result = await resendVerificationEmail({
      email: 'demo@example.com',
      captchaToken: 'captcha-token',
    });

    expect(result).toEqual({ accepted: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/resend-verification-email'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('submits login requests to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
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

    const result = await login({
      usernameOrEmail: 'demo',
      password: 'demo-password',
      captchaToken: 'captcha-token',
    });

    expect(result).toMatchObject({
      authenticated: true,
      username: 'demo',
      email: 'demo@example.com',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/login'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        usernameOrEmail: 'demo',
        password: 'demo-password',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('returns a two-factor login challenge when the backend requires a second step', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          requiresTwoFactor: true,
          loginChallengeId: 'login-challenge-id',
          methods: ['TOTP', 'BACKUP_CODE'],
          expiresAt: '2026-03-24T10:15:30Z',
        }),
        {
          status: 202,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await login({
      usernameOrEmail: 'demo',
      password: 'demo-password',
      captchaToken: 'captcha-token',
    });

    expect(result).toEqual({
      requiresTwoFactor: true,
      loginChallengeId: 'login-challenge-id',
      methods: ['TOTP', 'BACKUP_CODE'],
      expiresAt: '2026-03-24T10:15:30Z',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/login'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        usernameOrEmail: 'demo',
        password: 'demo-password',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('submits logout requests to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await logout();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/logout'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBeUndefined();
  });
});
