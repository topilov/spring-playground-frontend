import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildApiUrl } from '../../shared/api/apiClient';
import {
  confirmTelegramConnectionCode,
  confirmTelegramConnectionPassword,
  createTelegramAutomationToken,
  disconnectTelegram,
  getTelegramSettings,
  regenerateTelegramAutomationToken,
  revokeTelegramAutomationToken,
  startTelegramConnection,
  updateTelegramFocusSettings,
} from './api';

describe('telegram api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads telegram settings and maps optional values', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          connected: true,
          connectionStatus: 'CONNECTED',
          telegramUser: {
            id: 900001,
            phoneNumber: '+15551234567',
            username: 'telegram-1',
            displayName: 'Telegram User 1',
            premium: true,
          },
          automationToken: {
            present: true,
            tokenHint: 'tgf_abcd...',
            createdAt: '2026-03-26T10:15:30Z',
            lastUsedAt: '2026-03-26T11:00:00Z',
          },
          defaultEmojiStatusDocumentId: '7000',
          effectiveFocusMode: 'sleep',
          resolvedEmojiMappings: {
            personal: '1001',
            airplane: '1002',
            do_not_disturb: '1003',
            reduce_interruptions: '1004',
            sleep: '1005',
          },
          activeFocusModes: ['sleep'],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await getTelegramSettings();

    expect(result).toEqual({
      connected: true,
      connectionStatus: 'CONNECTED',
      telegramUser: {
        id: 900001,
        phoneNumber: '+15551234567',
        username: 'telegram-1',
        displayName: 'Telegram User 1',
        premium: true,
      },
      pendingAuth: null,
      automationToken: {
        present: true,
        tokenHint: 'tgf_abcd...',
        createdAt: '2026-03-26T10:15:30Z',
        lastUsedAt: '2026-03-26T11:00:00Z',
      },
      defaultEmojiStatusDocumentId: '7000',
      effectiveFocusMode: 'sleep',
      resolvedEmojiMappings: {
        personal: '1001',
        airplane: '1002',
        do_not_disturb: '1003',
        reduce_interruptions: '1004',
        sleep: '1005',
      },
      activeFocusModes: ['sleep'],
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/telegram'));
    expect(init?.method).toBe('GET');
    expect(init?.credentials).toBe('include');
  });

  it('starts the telegram connection flow with a trimmed phone number', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          connected: false,
          pendingAuthId: 'telegram-auth-opaque-id',
          nextStep: 'CODE',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await startTelegramConnection({
      phoneNumber: '  +15551234567  ',
    });

    expect(result).toEqual({
      connected: false,
      connectionStatus: 'DISCONNECTED',
      telegramUser: null,
      pendingAuth: {
        pendingAuthId: 'telegram-auth-opaque-id',
        nextStep: 'CODE',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/telegram/connect/start'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ phoneNumber: '+15551234567' }));
  });

  it('confirms the telegram connection code and handles a password step response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          connected: false,
          pendingAuthId: 'telegram-auth-opaque-id',
          nextStep: 'PASSWORD',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const result = await confirmTelegramConnectionCode({
      pendingAuthId: 'telegram-auth-opaque-id',
      code: ' 12345 ',
    });

    expect(result).toEqual({
      connected: false,
      connectionStatus: 'DISCONNECTED',
      telegramUser: null,
      pendingAuth: {
        pendingAuthId: 'telegram-auth-opaque-id',
        nextStep: 'PASSWORD',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/telegram/connect/confirm-code'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(
      JSON.stringify({
        pendingAuthId: 'telegram-auth-opaque-id',
        code: '12345',
      })
    );
  });

  it('confirms the telegram connection password and returns the connected user', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          connected: true,
          connectionStatus: 'CONNECTED',
          telegramUser: {
            id: 900001,
            phoneNumber: '+15551234567',
            displayName: 'Telegram User 1',
            premium: false,
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

    const result = await confirmTelegramConnectionPassword({
      pendingAuthId: 'telegram-auth-opaque-id',
      password: '  telegram-secret  ',
    });

    expect(result).toEqual({
      connected: true,
      connectionStatus: 'CONNECTED',
      telegramUser: {
        id: 900001,
        phoneNumber: '+15551234567',
        username: null,
        displayName: 'Telegram User 1',
        premium: false,
      },
      pendingAuth: null,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/telegram/connect/confirm-password'));
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(
      JSON.stringify({
        pendingAuthId: 'telegram-auth-opaque-id',
        password: 'telegram-secret',
      })
    );
  });

  it('updates telegram focus settings with trimmed values', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          connected: false,
          automationToken: {
            present: false,
          },
          defaultEmojiStatusDocumentId: '7000',
          resolvedEmojiMappings: {
            personal: '1001',
            sleep: '1005',
          },
          activeFocusModes: [],
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );

    await updateTelegramFocusSettings({
      defaultEmojiStatusDocumentId: ' 7000 ',
      mappings: {
        personal: ' 1001 ',
        airplane: ' ',
        sleep: '1005',
      },
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(buildApiUrl('/api/profile/me/telegram/focus-settings'));
    expect(init?.method).toBe('PUT');
    expect(init?.body).toBe(
      JSON.stringify({
        defaultEmojiStatusDocumentId: '7000',
        mappings: {
          personal: '1001',
          sleep: '1005',
        },
      })
    );
  });

  it('creates and regenerates the automation token and revokes it', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: 'tgf_very_long_random_token',
            tokenHint: 'tgf_very...',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            token: 'tgf_new_long_random_token',
            tokenHint: 'tgf_new...',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(createTelegramAutomationToken()).resolves.toEqual({
      token: 'tgf_very_long_random_token',
      tokenHint: 'tgf_very...',
    });
    await expect(regenerateTelegramAutomationToken()).resolves.toEqual({
      token: 'tgf_new_long_random_token',
      tokenHint: 'tgf_new...',
    });
    await expect(revokeTelegramAutomationToken()).resolves.toBeUndefined();
    await expect(disconnectTelegram()).resolves.toBeUndefined();

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      buildApiUrl('/api/profile/me/telegram/automation-token')
    );
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe('POST');

    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      buildApiUrl('/api/profile/me/telegram/automation-token/regenerate')
    );
    expect(fetchMock.mock.calls[1]?.[1]?.method).toBe('POST');

    expect(fetchMock.mock.calls[2]?.[0]).toBe(
      buildApiUrl('/api/profile/me/telegram/automation-token')
    );
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe('DELETE');

    expect(fetchMock.mock.calls[3]?.[0]).toBe(buildApiUrl('/api/profile/me/telegram/connect'));
    expect(fetchMock.mock.calls[3]?.[1]?.method).toBe('DELETE');
  });
});
