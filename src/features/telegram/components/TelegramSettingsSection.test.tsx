/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError } from '../../../shared/api/apiClient';
import { TelegramSettingsSection } from './TelegramSettingsSection';

const useTelegramSettingsQueryMock = vi.fn();
const useStartTelegramConnectionMutationMock = vi.fn();
const useConfirmTelegramConnectionCodeMutationMock = vi.fn();
const useConfirmTelegramConnectionPasswordMutationMock = vi.fn();
const useDisconnectTelegramMutationMock = vi.fn();
const useUpdateTelegramFocusSettingsMutationMock = vi.fn();
const useCreateTelegramModeMutationMock = vi.fn();
const useUpdateTelegramModeMutationMock = vi.fn();
const useDeleteTelegramModeMutationMock = vi.fn();
const useCreateTelegramAutomationTokenMutationMock = vi.fn();
const useRegenerateTelegramAutomationTokenMutationMock = vi.fn();
const useRevokeTelegramAutomationTokenMutationMock = vi.fn();
const clipboardWriteTextMock = vi.fn();

vi.mock('../hooks', () => ({
  useTelegramSettingsQuery: () => useTelegramSettingsQueryMock(),
  useStartTelegramConnectionMutation: () => useStartTelegramConnectionMutationMock(),
  useConfirmTelegramConnectionCodeMutation: () =>
    useConfirmTelegramConnectionCodeMutationMock(),
  useConfirmTelegramConnectionPasswordMutation: () =>
    useConfirmTelegramConnectionPasswordMutationMock(),
  useDisconnectTelegramMutation: () => useDisconnectTelegramMutationMock(),
  useUpdateTelegramFocusSettingsMutation: () =>
    useUpdateTelegramFocusSettingsMutationMock(),
  useCreateTelegramModeMutation: () => useCreateTelegramModeMutationMock(),
  useUpdateTelegramModeMutation: () => useUpdateTelegramModeMutationMock(),
  useDeleteTelegramModeMutation: () => useDeleteTelegramModeMutationMock(),
  useCreateTelegramAutomationTokenMutation: () =>
    useCreateTelegramAutomationTokenMutationMock(),
  useRegenerateTelegramAutomationTokenMutation: () =>
    useRegenerateTelegramAutomationTokenMutationMock(),
  useRevokeTelegramAutomationTokenMutation: () =>
    useRevokeTelegramAutomationTokenMutationMock(),
}));

function createSettings(overrides: Record<string, unknown> = {}) {
  return {
    connected: false,
    connectionStatus: 'DISCONNECTED' as const,
    telegramUser: null,
    pendingAuth: null,
    automationToken: {
      present: false,
      tokenHint: null,
      createdAt: null,
      lastUsedAt: null,
    },
    defaultEmojiStatusDocumentId: null,
    activeFocusMode: null,
    modes: [],
    ...overrides,
  };
}

describe('TelegramSettingsSection', () => {
  beforeEach(() => {
    useTelegramSettingsQueryMock.mockReturnValue({
      data: createSettings(),
      isLoading: false,
      isError: false,
      error: null,
    });
    useStartTelegramConnectionMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useConfirmTelegramConnectionCodeMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useConfirmTelegramConnectionPasswordMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useDisconnectTelegramMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useUpdateTelegramFocusSettingsMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useCreateTelegramModeMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useUpdateTelegramModeMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useDeleteTelegramModeMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useCreateTelegramAutomationTokenMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useRegenerateTelegramAutomationTokenMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useRevokeTelegramAutomationTokenMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });

    clipboardWriteTextMock.mockReset();
    clipboardWriteTextMock.mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteTextMock,
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('starts the connection flow from the disconnected state and reveals the code step', async () => {
    const user = userEvent.setup();
    const startConnection = vi.fn().mockResolvedValue({
      connected: false,
      connectionStatus: 'DISCONNECTED',
      telegramUser: null,
      pendingAuth: {
        pendingAuthId: 'telegram-auth-opaque-id',
        nextStep: 'CODE',
      },
    });

    useStartTelegramConnectionMutationMock.mockReturnValue({
      mutateAsync: startConnection,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.type(screen.getByLabelText('Phone number'), '  +15551234567  ');
    await user.click(screen.getByRole('button', { name: 'Connect Telegram' }));

    await waitFor(() => {
      expect(startConnection).toHaveBeenCalledWith({
        phoneNumber: '+15551234567',
      });
    });

    expect(await screen.findByLabelText('Login code')).toBeTruthy();
  });

  it('renders the password step from backend state and confirms the password', async () => {
    const user = userEvent.setup();
    const confirmPassword = vi.fn().mockResolvedValue({
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

    useTelegramSettingsQueryMock.mockReturnValue({
      data: createSettings({
        pendingAuth: {
          pendingAuthId: 'telegram-auth-opaque-id',
          nextStep: 'PASSWORD',
        },
      }),
      isLoading: false,
      isError: false,
      error: null,
    });
    useConfirmTelegramConnectionPasswordMutationMock.mockReturnValue({
      mutateAsync: confirmPassword,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.type(screen.getByLabelText('Telegram password'), '  telegram-secret ');
    await user.click(screen.getByRole('button', { name: 'Confirm password' }));

    await waitFor(() => {
      expect(confirmPassword).toHaveBeenCalledWith({
        pendingAuthId: 'telegram-auth-opaque-id',
        password: 'telegram-secret',
      });
    });

    expect(await screen.findByText('Telegram User 1')).toBeTruthy();
  });

  it('saves trimmed focus settings without source labels', async () => {
    const user = userEvent.setup();
    const updateFocusSettings = vi.fn().mockResolvedValue(createSettings());

    useTelegramSettingsQueryMock.mockReturnValue({
      data: createSettings({
        defaultEmojiStatusDocumentId: '7000',
        modes: [
          {
            mode: 'work',
            emojiStatusDocumentId: '1001',
          },
        ],
      }),
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateTelegramFocusSettingsMutationMock.mockReturnValue({
      mutateAsync: updateFocusSettings,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.clear(screen.getByLabelText('No focus emoji status'));
    await user.type(screen.getByLabelText('No focus emoji status'), ' 7001 ');
    await user.click(screen.getByRole('button', { name: 'Save default status' }));

    await waitFor(() => {
      expect(updateFocusSettings).toHaveBeenCalledWith({
        defaultEmojiStatusDocumentId: '7001',
      });
    });

    expect(screen.queryByLabelText('Personal')).toBeNull();
  });

  it('creates a custom telegram mode with trimmed values', async () => {
    const user = userEvent.setup();
    const createMode = vi.fn().mockResolvedValue({
      mode: 'deep_work',
      emojiStatusDocumentId: '2001',
    });

    useCreateTelegramModeMutationMock.mockReturnValue({
      mutateAsync: createMode,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.type(screen.getByLabelText('New mode name'), '  deep_work  ');
    await user.type(screen.getByLabelText('New mode emoji status'), ' 2001 ');
    await user.click(screen.getByRole('button', { name: 'Add mode' }));

    await waitFor(() => {
      expect(createMode).toHaveBeenCalledWith({
        mode: 'deep_work',
        emojiStatusDocumentId: '2001',
      });
    });
  });

  it('updates and deletes an existing custom telegram mode', async () => {
    const user = userEvent.setup();
    const updateMode = vi.fn().mockResolvedValue({
      mode: 'deep_work',
      emojiStatusDocumentId: '1002',
    });
    const deleteMode = vi.fn().mockResolvedValue(undefined);

    useTelegramSettingsQueryMock.mockReturnValue({
      data: createSettings({
        modes: [
          {
            mode: 'work',
            emojiStatusDocumentId: '1001',
          },
        ],
      }),
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateTelegramModeMutationMock.mockReturnValue({
      mutateAsync: updateMode,
      isPending: false,
    });
    useDeleteTelegramModeMutationMock.mockReturnValue({
      mutateAsync: deleteMode,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.clear(screen.getByLabelText('Mode name for work'));
    await user.type(screen.getByLabelText('Mode name for work'), '  deep_work ');
    await user.clear(screen.getByLabelText('Emoji status for work'));
    await user.type(screen.getByLabelText('Emoji status for work'), ' 1002 ');
    await user.click(screen.getByRole('button', { name: 'Save mode work' }));

    await waitFor(() => {
      expect(updateMode).toHaveBeenCalledWith({
        mode: 'work',
        newMode: 'deep_work',
        emojiStatusDocumentId: '1002',
      });
    });

    await user.click(screen.getByRole('button', { name: 'Delete mode work' }));

    await waitFor(() => {
      expect(deleteMode).toHaveBeenCalledWith('work');
    });
  });

  it('shows the raw automation token once after creation and supports copy', async () => {
    const user = userEvent.setup();
    const createToken = vi.fn().mockResolvedValue({
      token: 'tgf_very_long_random_token',
      tokenHint: 'tgf_very...',
    });

    useCreateTelegramAutomationTokenMutationMock.mockReturnValue({
      mutateAsync: createToken,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.click(screen.getByRole('button', { name: 'Create token' }));

    expect(await screen.findByDisplayValue('tgf_very_long_random_token')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Copy token' }));
    expect(await screen.findByText('Token copied.')).toBeTruthy();
  });

  it('renders the current state and warns when telegram premium is unavailable', () => {
    useTelegramSettingsQueryMock.mockReturnValue({
      data: createSettings({
        connected: true,
        connectionStatus: 'CONNECTED',
        telegramUser: {
          id: 900001,
          phoneNumber: '+15551234567',
          username: 'telegram-1',
          displayName: 'Telegram User 1',
          premium: false,
        },
        defaultEmojiStatusDocumentId: '7000',
        activeFocusMode: 'sleep',
        modes: [
          {
            mode: 'sleep',
            emojiStatusDocumentId: '1005',
          },
        ],
      }),
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<TelegramSettingsSection />);

    expect(screen.getAllByText('sleep')).toHaveLength(2);
    expect(screen.getByText('1005')).toBeTruthy();
    expect(screen.getByText('Telegram Premium is required for emoji status sync.')).toBeTruthy();
  });

  it('maps known telegram auth errors to a short message', async () => {
    const user = userEvent.setup();
    const startConnection = vi.fn().mockRejectedValue(
      new ApiClientError({
        status: 404,
        statusText: 'Not Found',
        url: 'http://localhost/api/profile/me/telegram/connect/start',
        responseBody: {
          code: 'TELEGRAM_PENDING_AUTH_NOT_FOUND',
        },
      })
    );

    useStartTelegramConnectionMutationMock.mockReturnValue({
      mutateAsync: startConnection,
      isPending: false,
    });

    render(<TelegramSettingsSection />);

    await user.type(screen.getByLabelText('Phone number'), '+15551234567');
    await user.click(screen.getByRole('button', { name: 'Connect Telegram' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'That Telegram sign-in step expired. Start again.'
    );
  });
});
