import { afterEach, describe, expect, it, vi } from 'vitest';

describe('appConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses the configured API base URL when VITE_API_BASE_URL is set', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

    const { appConfig } = await import('./appConfig');

    expect(appConfig.apiBaseUrl).toBe('https://api.example.test');
  });

  it('falls back to the localhost API in development when VITE_API_BASE_URL is missing', async () => {
    vi.stubEnv('MODE', 'development');
    vi.stubEnv('VITE_API_BASE_URL', '');

    const { DEFAULT_API_BASE_URL, appConfig, resolveApiBaseUrl } = await import('./appConfig');

    expect(appConfig.apiBaseUrl).toBe(DEFAULT_API_BASE_URL);
    expect(resolveApiBaseUrl(undefined, 'development')).toBe(DEFAULT_API_BASE_URL);
  });
});
