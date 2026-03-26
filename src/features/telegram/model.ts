import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';

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

export interface TelegramMode {
  mode: string;
  emojiStatusDocumentId: string;
}

export interface TelegramSettings {
  connected: boolean;
  connectionStatus: TelegramConnectionStatus;
  telegramUser: TelegramUserSummary | null;
  pendingAuth: TelegramPendingAuth | null;
  automationToken: TelegramAutomationTokenSummary;
  defaultEmojiStatusDocumentId: string | null;
  activeFocusMode: string | null;
  modes: TelegramMode[];
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
}

export interface CreateTelegramModeInput {
  mode: string;
  emojiStatusDocumentId: string;
}

export interface UpdateTelegramModeInput {
  mode: string;
  newMode?: string;
  emojiStatusDocumentId?: string | null;
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
export type TelegramCreateModeRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/modes',
  'post'
>;
export type TelegramUpdateModeRequestDto = ApiRequestBody<
  '/api/profile/me/telegram/modes/{mode}',
  'patch'
>;
export type TelegramAutomationTokenResponseDto = ApiResponse<
  '/api/profile/me/telegram/automation-token',
  'post'
>;
export type TelegramModeResponseDto = ApiResponse<
  '/api/profile/me/telegram/modes',
  'post',
  201
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

function mapTelegramMode(payload: TelegramModeResponseDto): TelegramMode {
  return {
    mode: payload.mode,
    emojiStatusDocumentId: payload.emojiStatusDocumentId,
  };
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
    activeFocusMode: payload.activeFocusMode ?? null,
    modes: payload.modes.map(mapTelegramMode),
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

  return {
    ...(defaultEmojiStatusDocumentId ? { defaultEmojiStatusDocumentId } : {}),
  };
}

export function toTelegramCreateModeRequest(
  payload: CreateTelegramModeInput
): TelegramCreateModeRequestDto {
  return {
    mode: payload.mode.trim(),
    emojiStatusDocumentId: payload.emojiStatusDocumentId.trim(),
  };
}

export function toTelegramUpdateModeRequest(
  payload: UpdateTelegramModeInput
): TelegramUpdateModeRequestDto {
  const newMode = normalizeOptionalString(payload.newMode);
  const emojiStatusDocumentId = normalizeOptionalString(payload.emojiStatusDocumentId);

  return {
    ...(newMode ? { newMode } : {}),
    ...(emojiStatusDocumentId ? { emojiStatusDocumentId } : {}),
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

export function mapTelegramModeResponse(payload: TelegramModeResponseDto): TelegramMode {
  return mapTelegramMode(payload);
}
