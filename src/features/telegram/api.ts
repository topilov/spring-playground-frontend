import { request } from '../../shared/api/apiClient';
import {
  mapTelegramAutomationTokenResponse,
  mapTelegramConnectResponse,
  mapTelegramSettingsResponse,
  toTelegramConnectCodeRequest,
  toTelegramConnectPasswordRequest,
  toTelegramConnectStartRequest,
  toTelegramFocusSettingsRequest,
  type ConfirmTelegramConnectionCodeInput,
  type ConfirmTelegramConnectionPasswordInput,
  type StartTelegramConnectionInput,
  type TelegramAutomationToken,
  type TelegramAutomationTokenResponseDto,
  type TelegramConnectionState,
  type TelegramConnectResponseDto,
  type TelegramSettings,
  type TelegramSettingsResponseDto,
  type UpdateTelegramFocusSettingsInput,
} from './model';

export function getTelegramSettings(): Promise<TelegramSettings> {
  return request<TelegramSettingsResponseDto>('/api/profile/me/telegram').then(
    mapTelegramSettingsResponse
  );
}

export function startTelegramConnection(
  payload: StartTelegramConnectionInput
): Promise<TelegramConnectionState> {
  return request<TelegramConnectResponseDto>('/api/profile/me/telegram/connect/start', {
    method: 'POST',
    body: toTelegramConnectStartRequest(payload),
  }).then(mapTelegramConnectResponse);
}

export function confirmTelegramConnectionCode(
  payload: ConfirmTelegramConnectionCodeInput
): Promise<TelegramConnectionState> {
  return request<TelegramConnectResponseDto>(
    '/api/profile/me/telegram/connect/confirm-code',
    {
      method: 'POST',
      body: toTelegramConnectCodeRequest(payload),
    }
  ).then(mapTelegramConnectResponse);
}

export function confirmTelegramConnectionPassword(
  payload: ConfirmTelegramConnectionPasswordInput
): Promise<TelegramConnectionState> {
  return request<TelegramConnectResponseDto>(
    '/api/profile/me/telegram/connect/confirm-password',
    {
      method: 'POST',
      body: toTelegramConnectPasswordRequest(payload),
    }
  ).then(mapTelegramConnectResponse);
}

export function disconnectTelegram(): Promise<void> {
  return request<void>('/api/profile/me/telegram/connect', {
    method: 'DELETE',
  });
}

export function updateTelegramFocusSettings(
  payload: UpdateTelegramFocusSettingsInput
): Promise<TelegramSettings> {
  return request<TelegramSettingsResponseDto>('/api/profile/me/telegram/focus-settings', {
    method: 'PUT',
    body: toTelegramFocusSettingsRequest(payload),
  }).then(mapTelegramSettingsResponse);
}

export function createTelegramAutomationToken(): Promise<TelegramAutomationToken> {
  return request<TelegramAutomationTokenResponseDto>(
    '/api/profile/me/telegram/automation-token',
    {
      method: 'POST',
    }
  ).then(mapTelegramAutomationTokenResponse);
}

export function regenerateTelegramAutomationToken(): Promise<TelegramAutomationToken> {
  return request<TelegramAutomationTokenResponseDto>(
    '/api/profile/me/telegram/automation-token/regenerate',
    {
      method: 'POST',
    }
  ).then(mapTelegramAutomationTokenResponse);
}

export function revokeTelegramAutomationToken(): Promise<void> {
  return request<void>('/api/profile/me/telegram/automation-token', {
    method: 'DELETE',
  });
}
