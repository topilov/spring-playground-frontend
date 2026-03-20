import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { request } from './apiClient';

describe('request', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends JSON with credentials and parses JSON responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const result = await request<{ status: string }>('/api/public/ping', {
      method: 'POST',
      body: { probe: true },
    });

    expect(result).toEqual({ status: 'ok' });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('http://localhost:8080/api/public/ping');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ probe: true }));

    const headers = init?.headers as Headers;
    expect(headers.get('Accept')).toBe('application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('returns undefined for no-content responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    );

    const result = await request<void>('/api/auth/logout', {
      method: 'POST',
    });

    expect(result).toBeUndefined();
  });

  it('throws a structured error for non-ok responses', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: 'Bad Request' }), {
        status: 400,
        statusText: 'Bad Request',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    await expect(
      request('/api/profile/me', {
        method: 'PUT',
        body: { displayName: '' },
      })
    ).rejects.toMatchObject({
      name: 'ApiClientError',
      message: 'Request failed with status 400',
      status: 400,
      responseBody: { error: 'Bad Request' },
      url: 'http://localhost:8080/api/profile/me',
    });
  });

  it('allows a future csrf token header to be passed explicitly', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ authenticated: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    await request('/api/auth/login', {
      method: 'POST',
      body: { usernameOrEmail: 'demo', password: 'demo-password' },
      csrfToken: 'csrf-token',
    });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get('X-CSRF-Token')).toBe('csrf-token');
  });
});
