import type { SessionUser, LoginSuccessResponseDto } from '../../entities/session/model';
import {
  mapDisableTwoFactorResponse,
  mapRegenerateBackupCodesResponse,
  mapTwoFactorLoginVerifyResponse,
  mapTwoFactorSetupConfirmResponse,
  mapTwoFactorSetupStartResponse,
  mapTwoFactorStatusResponse,
  toTwoFactorBackupCodeLoginVerifyRequest,
  toTwoFactorLoginVerifyRequest,
  toTwoFactorSetupConfirmRequest,
  type ConfirmTwoFactorSetupInput,
  type ConfirmTwoFactorSetupResult,
  type DisableTwoFactorResponseDto,
  type DisableTwoFactorResult,
  type RegenerateBackupCodesResponseDto,
  type RegeneratedBackupCodesResult,
  type TwoFactorBackupCodeLoginVerifyResponseDto,
  type TwoFactorLoginVerifyResponseDto,
  type TwoFactorSetupData,
  type TwoFactorSetupConfirmResponseDto,
  type TwoFactorSetupStartResponseDto,
  type TwoFactorStatus,
  type TwoFactorStatusResponseDto,
  type VerifyTwoFactorBackupCodeLoginInput,
  type VerifyTwoFactorLoginInput,
} from '../../entities/twoFactor/model';
import { request } from '../../shared/api/apiClient';

export function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return request<TwoFactorStatusResponseDto>('/api/auth/2fa/status').then(
    mapTwoFactorStatusResponse
  );
}

export function startTwoFactorSetup(): Promise<TwoFactorSetupData> {
  return request<TwoFactorSetupStartResponseDto>('/api/auth/2fa/setup/start', {
    method: 'POST',
  }).then(mapTwoFactorSetupStartResponse);
}

export function confirmTwoFactorSetup(
  payload: ConfirmTwoFactorSetupInput
): Promise<ConfirmTwoFactorSetupResult> {
  return request<TwoFactorSetupConfirmResponseDto>('/api/auth/2fa/setup/confirm', {
    method: 'POST',
    body: toTwoFactorSetupConfirmRequest(payload),
  }).then(mapTwoFactorSetupConfirmResponse);
}

export function regenerateBackupCodes(): Promise<RegeneratedBackupCodesResult> {
  return request<RegenerateBackupCodesResponseDto>('/api/auth/2fa/backup-codes/regenerate', {
    method: 'POST',
  }).then(mapRegenerateBackupCodesResponse);
}

export function disableTwoFactor(): Promise<DisableTwoFactorResult> {
  return request<DisableTwoFactorResponseDto>('/api/auth/2fa/disable', {
    method: 'POST',
  }).then(mapDisableTwoFactorResponse);
}

export function verifyTwoFactorLogin(
  payload: VerifyTwoFactorLoginInput
): Promise<SessionUser> {
  return request<LoginSuccessResponseDto | TwoFactorLoginVerifyResponseDto>(
    '/api/auth/2fa/login/verify',
    {
      method: 'POST',
      body: toTwoFactorLoginVerifyRequest(payload),
    }
  ).then(mapTwoFactorLoginVerifyResponse);
}

export function verifyTwoFactorBackupCodeLogin(
  payload: VerifyTwoFactorBackupCodeLoginInput
): Promise<SessionUser> {
  return request<LoginSuccessResponseDto | TwoFactorBackupCodeLoginVerifyResponseDto>(
    '/api/auth/2fa/login/verify-backup-code',
    {
      method: 'POST',
      body: toTwoFactorBackupCodeLoginVerifyRequest(payload),
    }
  ).then(mapTwoFactorLoginVerifyResponse);
}
