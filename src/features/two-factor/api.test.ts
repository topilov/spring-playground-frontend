import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl } from '../../shared/api/apiClient';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  getTwoFactorStatus,
  regenerateBackupCodes,
  startTwoFactorSetup,
  verifyTwoFactorBackupCodeLogin,
  verifyTwoFactorLogin,
} from './api';

describe('two-factor api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the authenticated two-factor status', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          enabled: true,
          pendingSetup: false,
          backupCodesRemaining: 7,
          enabledAt: '2026-03-24T10:20:00Z',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await getTwoFactorStatus();

    expect(result).toEqual({
      enabled: true,
      pendingSetup: false,
      backupCodesRemaining: 7,
      enabledAt: '2026-03-24T10:20:00Z',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/status'));
    expect(init?.method).toBe('GET');
    expect(init?.credentials).toBe('include');
  });

  it('starts authenticated totp setup', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          secret: 'JBSWY3DPEHPK3PXP',
          otpauthUri:
            'otpauth://totp/Spring%20Playground:demo%40example.com?secret=JBSWY3DPEHPK3PXP',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await startTwoFactorSetup();

    expect(result).toEqual({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUri:
        'otpauth://totp/Spring%20Playground:demo%40example.com?secret=JBSWY3DPEHPK3PXP',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/setup/start'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
  });

  it('confirms totp setup and returns backup codes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          enabled: true,
          backupCodes: ['ABCD-EFGH-JKLM', 'MNPR-STUV-WXYZ'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await confirmTwoFactorSetup({
      code: '123456',
    });

    expect(result).toEqual({
      enabled: true,
      backupCodes: ['ABCD-EFGH-JKLM', 'MNPR-STUV-WXYZ'],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/setup/confirm'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(JSON.stringify({ code: '123456' }));
  });

  it('regenerates backup codes for an enabled account', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          backupCodes: ['ZXCV-BNMQ-POIU'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await regenerateBackupCodes();

    expect(result).toEqual({
      backupCodes: ['ZXCV-BNMQ-POIU'],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/backup-codes/regenerate'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
  });

  it('disables totp and removes backup codes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          disabled: true,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await disableTwoFactor();

    expect(result).toEqual({
      disabled: true,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/disable'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
  });

  it('verifies a pending totp login challenge', async () => {
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

    const result = await verifyTwoFactorLogin({
      loginChallengeId: 'login-challenge-id',
      code: '123456',
      captchaToken: 'captcha-token',
    });

    expect(result).toMatchObject({
      authenticated: true,
      username: 'demo',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/login/verify'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        loginChallengeId: 'login-challenge-id',
        code: '123456',
        captchaToken: 'captcha-token',
      })
    );
  });

  it('verifies a pending backup-code login challenge', async () => {
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

    const result = await verifyTwoFactorBackupCodeLogin({
      loginChallengeId: 'login-challenge-id',
      backupCode: 'ABCD-EFGH-JKLM',
      captchaToken: 'captcha-token',
    });

    expect(result).toMatchObject({
      authenticated: true,
      username: 'demo',
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/auth/2fa/login/verify-backup-code'));
    expect(init?.method).toBe('POST');
    expect(init?.credentials).toBe('include');
    expect(init?.body).toBe(
      JSON.stringify({
        loginChallengeId: 'login-challenge-id',
        backupCode: 'ABCD-EFGH-JKLM',
        captchaToken: 'captcha-token',
      })
    );
  });
});
