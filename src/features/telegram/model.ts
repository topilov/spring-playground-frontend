import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';

export const telegramFocusModes = [
  'personal',
  'airplane',
  'do_not_disturb',
  'reduce_interruptions',
  'sleep',
] as const;

export type TelegramFocusMode = (typeof telegramFocusModes)[number];
export type TelegramConnectionStatus = 'DISCONNECTED' | 'CONNECTED';
export type TelegramPendingAuthStep = 'CODE' | 'PASSWORD';

export interface TelegramUserSummary {
  id: number;
  phoneNumber: string;
  username: string | null;
  displayName: string;
  premium: boolean;
}

export interface TelegramPendingAuth {
  pendingAuthId: string;
  nextStep: TelegramPendingAuthStep;
}

export interface TelegramAutomationTokenSummary {
  present: boolean;
  tokenHint: string | null;
  createdAt: string | null;
  lastUsedAt: string | null;
}

export interface TelegramSettings {
  connected: boolean;
  connectionStatus: TelegramConnectionStatus;
  telegramUser: TelegramUserSummary | null;
  pendingAuth: TelegramPendingAuth | null;
  automationToken: TelegramAutomationTokenSummary;
  defaultEmojiStatusDocumentId: string | null;
  effectiveFocusMode: TelegramFocusMode | null;
  resolvedEmojiMappings: Partial<Record<TelegramFocusMode, string>>;
  activeFocusModes: TelegramFocusMode[];
}

export interface TelegramConnectionState {
  connected: boolean;
  connectionStatus: TelegramConnectionStatus;
  telegramUser: TelegramUserSummary | null;
  pendingAuth: TelegramPendingAuth | null;
}

export interface StartTelegramConnectionInput {
  phoneNumber: string;
}

export interface ConfirmTelegramConnectionCodeInput {
  pendingAuthId: string;
  code: string;
}

export interface ConfirmTelegramConnectionPasswordInput {
  pendingAuthId: string;
  password: string;
}

export interface UpdateTelegramFocusSettingsInput {
  defaultEmojiStatusDocumentId?: string | null;
  mappings: Partial<Record<TelegramFocusMode, string>>;
}

export interface TelegramAutomationToken {
  token: string;
  tokenHint: string;
}

export type TelegramSettingsResponseDto = ApiResponse<'/api/profile/me/telegram', 'get'>;
export type TelegramConnectStartRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/connect/start',
  'post'
>;
export type TelegramConnectCodeRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/connect/confirm-code',
  'post'
>;
export type TelegramConnectPasswordRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/connect/confirm-password',
  'post'
>;
export type TelegramConnectResponseDto = ApiResponse<
  '/api/profile/me/telegram/connect/start',
  'post'
>;
export type TelegramFocusSettingsRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/focus-settings',
  'put'
>;
export type TelegramAutomationTokenResponseDto = ApiResponse<
  '/api/profile/me/telegram/automation-token',
  'post'
>;

function normalizeOptionalString(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizeNullableString(value: string | null | undefined): string | null {
  return normalizeOptionalString(value) ?? null;
}

function mapTelegramUser(
  payload: TelegramSettingsResponseDto['telegramUser'] | TelegramConnectResponseDto['telegramUser']
): TelegramUserSummary | null {
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    phoneNumber: payload.phoneNumber,
    username: payload.username ?? null,
    displayName: payload.displayName,
    premium: payload.premium,
  };
}

function mapPendingAuth(
  pendingAuthId: string | undefined,
  nextStep: TelegramPendingAuthStep | undefined
): TelegramPendingAuth | null {
  if (!pendingAuthId || !nextStep) {
    return null;
  }

  return {
    pendingAuthId,
    nextStep,
  };
}

function mapConnectionStatus(
  connected: boolean,
  status: TelegramConnectionStatus | undefined
): TelegramConnectionStatus {
  if (status) {
    return status;
  }

  return connected ? 'CONNECTED' : 'DISCONNECTED';
}

function mapResolvedEmojiMappings(
  mappings: TelegramSettingsResponseDto['resolvedEmojiMappings']
): Partial<Record<TelegramFocusMode, string>> {
  const result: Partial<Record<TelegramFocusMode, string>> = {};

  for (const mode of telegramFocusModes) {
    const value = mappings[mode];

    if (typeof value === 'string' && value.trim()) {
      result[mode] = value;
    }
  }

  return result;
}

export function mapTelegramSettingsResponse(
  payload: TelegramSettingsResponseDto
): TelegramSettings {
  return {
    connected: payload.connected,
    connectionStatus: mapConnectionStatus(payload.connected, payload.connectionStatus),
    telegramUser: mapTelegramUser(payload.telegramUser),
    pendingAuth: payload.pendingAuth
      ? {
          pendingAuthId: payload.pendingAuth.pendingAuthId,
          nextStep: payload.pendingAuth.nextStep,
        }
      : null,
    automationToken: {
      present: payload.automationToken.present,
      tokenHint: normalizeNullableString(payload.automationToken.tokenHint),
      createdAt: payload.automationToken.createdAt ?? null,
      lastUsedAt: payload.automationToken.lastUsedAt ?? null,
    },
    defaultEmojiStatusDocumentId: normalizeNullableString(
      payload.defaultEmojiStatusDocumentId
    ),
    effectiveFocusMode: payload.effectiveFocusMode ?? null,
    resolvedEmojiMappings: mapResolvedEmojiMappings(payload.resolvedEmojiMappings),
    activeFocusModes: payload.activeFocusModes ?? [],
  };
}

export function toTelegramConnectStartRequest(
  payload: StartTelegramConnectionInput
): TelegramConnectStartRequestDto {
  return {
    phoneNumber: payload.phoneNumber.trim(),
  };
}

export function toTelegramConnectCodeRequest(
  payload: ConfirmTelegramConnectionCodeInput
): TelegramConnectCodeRequestDto {
  return {
    pendingAuthId: payload.pendingAuthId.trim(),
    code: payload.code.trim(),
  };
}

export function toTelegramConnectPasswordRequest(
  payload: ConfirmTelegramConnectionPasswordInput
): TelegramConnectPasswordRequestDto {
  return {
    pendingAuthId: payload.pendingAuthId.trim(),
    password: payload.password.trim(),
  };
}

export function mapTelegramConnectResponse(
  payload: TelegramConnectResponseDto
): TelegramConnectionState {
  return {
    connected: payload.connected,
    connectionStatus: mapConnectionStatus(payload.connected, payload.connectionStatus),
    telegramUser: mapTelegramUser(payload.telegramUser),
    pendingAuth: mapPendingAuth(payload.pendingAuthId, payload.nextStep),
  };
}

export function toTelegramFocusSettingsRequest(
  payload: UpdateTelegramFocusSettingsInput
): TelegramFocusSettingsRequestDto {
  const defaultEmojiStatusDocumentId = normalizeOptionalString(
    payload.defaultEmojiStatusDocumentId
  );
  const mappings = Object.fromEntries(
    Object.entries(payload.mappings).flatMap(([mode, value]) => {
      const normalized = normalizeOptionalString(value);
      return normalized ? [[mode, normalized]] : [];
    })
  );

  return {
    ...(defaultEmojiStatusDocumentId ? { defaultEmojiStatusDocumentId } : {}),
    ...(Object.keys(mappings).length > 0 ? { mappings } : {}),
  };
}

export function mapTelegramAutomationTokenResponse(
  payload: TelegramAutomationTokenResponseDto
): TelegramAutomationToken {
  return {
    token: payload.token,
    tokenHint: payload.tokenHint,
  };
}
