import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCurrentProfile } from './api';

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
    expect(url).toBe('http://localhost:8080/api/profile/me');
    expect(init?.method).toBe('GET');
    expect(init?.credentials).toBe('include');
  });
});
