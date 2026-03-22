import { afterEach, describe, expect, it, vi } from 'vitest';

describe('appConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('uses the configured API base URL when VITE_API_BASE_URL is set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');

    const { appConfig } = await import('./appConfig');

    expect(appConfig.apiBaseUrl).toBe('https://api.example.test');
  });

  it('returns an empty API base URL when VITE_API_BASE_URL is missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    const { appConfig, resolveApiBaseUrl } = await import('./appConfig');

    expect(appConfig.apiBaseUrl).toBe('');
    expect(resolveApiBaseUrl(undefined)).toBe('');
  });

  it('returns empty schema URLs when schema env values are missing', async () => {
    vi.stubEnv('VITE_API_SCHEMA_URL', '');
    vi.stubEnv('VITE_RAW_SCHEMA_URL', '');

    const { appConfig } = await import('./appConfig');

    expect(appConfig.apiSchemaUrl).toBe('');
    expect(appConfig.rawSchemaUrl).toBe('');
  });

  it('logs the raw and resolved VITE_API_BASE_URL values', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '  https://api.example.test  ');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    await import('./appConfig');

    expect(infoSpy).toHaveBeenCalledWith('[appConfig] VITE_API_BASE_URL', {
      resolved: 'https://api.example.test',
      value: '  https://api.example.test  ',
    });
  });
});
