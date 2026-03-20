import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  forgotPassword,
  login,
  logout,
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
    });

    expect(result).toEqual({
      userId: 2,
      username: 'new-user',
      email: 'new-user@example.com',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/auth/register');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        username: 'new-user',
        email: 'new-user@example.com',
        password: 'very-secret-password',
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
    });

    expect(result).toEqual({ accepted: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/auth/forgot-password');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ email: 'demo@example.com' }));
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
    expect(url).toBe('http://localhost:8080/api/auth/verify-email');
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
    });

    expect(result).toEqual({ accepted: true });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/auth/resend-verification-email');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ email: 'demo@example.com' }));
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
    });

    expect(result).toMatchObject({
      authenticated: true,
      username: 'demo',
      email: 'demo@example.com',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/auth/login');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
  });

  it('submits logout requests to the backend', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 204 }));

    await logout();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/auth/logout');
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBeUndefined();
  });
});
