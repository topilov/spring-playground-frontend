import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';
import type { LoginSuccessResponseDto, SessionUser } from '../session/model';

export type TwoFactorMethod = 'TOTP' | 'BACKUP_CODE';

export interface TwoFactorStatus {
  enabled: boolean;
  pendingSetup: boolean;
  backupCodesRemaining: number;
  enabledAt: string | null;
}

export interface TwoFactorSetupData {
  secret: string;
  otpauthUri: string;
}

export interface ConfirmTwoFactorSetupInput {
  code: string;
}

export interface ConfirmTwoFactorSetupResult {
  enabled: boolean;
  backupCodes: string[];
}

export interface RegeneratedBackupCodesResult {
  backupCodes: string[];
}

export interface DisableTwoFactorResult {
  disabled: boolean;
}

export interface VerifyTwoFactorLoginInput {
  loginChallengeId: string;
  code: string;
  captchaToken: string;
}

export interface VerifyTwoFactorBackupCodeLoginInput {
  loginChallengeId: string;
  backupCode: string;
  captchaToken: string;
}

export type TwoFactorStatusResponseDto = ApiResponse<'/api/auth/2fa/status', 'get'>;
export type TwoFactorSetupStartResponseDto = ApiResponse<
  '/api/auth/2fa/setup/start',
  'post'
>;
export type TwoFactorSetupConfirmRequestDto = ApiRequestBody<
  '/api/auth/2fa/setup/confirm',
  'post'
>;
export type TwoFactorSetupConfirmResponseDto = ApiResponse<
  '/api/auth/2fa/setup/confirm',
  'post'
>;
export type RegenerateBackupCodesResponseDto = ApiResponse<
  '/api/auth/2fa/backup-codes/regenerate',
  'post'
>;
export type DisableTwoFactorResponseDto = ApiResponse<'/api/auth/2fa/disable', 'post'>;
export type TwoFactorLoginVerifyRequestDto = ApiRequestBody<
  '/api/auth/2fa/login/verify',
  'post'
>;
export type TwoFactorBackupCodeLoginVerifyRequestDto = ApiRequestBody<
  '/api/auth/2fa/login/verify-backup-code',
  'post'
>;
export type TwoFactorLoginVerifyResponseDto = ApiResponse<
  '/api/auth/2fa/login/verify',
  'post'
>;
export type TwoFactorBackupCodeLoginVerifyResponseDto = ApiResponse<
  '/api/auth/2fa/login/verify-backup-code',
  'post'
>;

function normalizeCode(value: string): string {
  return value.trim();
}

export function mapTwoFactorStatusResponse(
  payload: TwoFactorStatusResponseDto
): TwoFactorStatus {
  return {
    enabled: payload.enabled,
    pendingSetup: payload.pendingSetup,
    backupCodesRemaining: payload.backupCodesRemaining,
    enabledAt: payload.enabledAt ?? null,
  };
}

export function mapTwoFactorSetupStartResponse(
  payload: TwoFactorSetupStartResponseDto
): TwoFactorSetupData {
  return {
    secret: payload.secret,
    otpauthUri: payload.otpauthUri,
  };
}

export function toTwoFactorSetupConfirmRequest(
  payload: ConfirmTwoFactorSetupInput
): TwoFactorSetupConfirmRequestDto {
  return {
    code: normalizeCode(payload.code),
  };
}

export function mapTwoFactorSetupConfirmResponse(
  payload: TwoFactorSetupConfirmResponseDto
): ConfirmTwoFactorSetupResult {
  return {
    enabled: payload.enabled,
    backupCodes: payload.backupCodes,
  };
}

export function mapRegenerateBackupCodesResponse(
  payload: RegenerateBackupCodesResponseDto
): RegeneratedBackupCodesResult {
  return {
    backupCodes: payload.backupCodes,
  };
}

export function mapDisableTwoFactorResponse(
  payload: DisableTwoFactorResponseDto
): DisableTwoFactorResult {
  return {
    disabled: payload.disabled,
  };
}

export function toTwoFactorLoginVerifyRequest(
  payload: VerifyTwoFactorLoginInput
): TwoFactorLoginVerifyRequestDto {
  return {
    loginChallengeId: payload.loginChallengeId,
    code: normalizeCode(payload.code),
    captchaToken: payload.captchaToken,
  };
}

export function toTwoFactorBackupCodeLoginVerifyRequest(
  payload: VerifyTwoFactorBackupCodeLoginInput
): TwoFactorBackupCodeLoginVerifyRequestDto {
  return {
    loginChallengeId: payload.loginChallengeId,
    backupCode: normalizeCode(payload.backupCode),
    captchaToken: payload.captchaToken,
  };
}

export function mapTwoFactorLoginVerifyResponse(
  payload:
    | LoginSuccessResponseDto
    | TwoFactorLoginVerifyResponseDto
    | TwoFactorBackupCodeLoginVerifyResponseDto
): SessionUser {
  return {
    authenticated: payload.authenticated,
    userId: payload.userId,
    username: payload.username,
    email: payload.email,
    role: payload.role,
  };
}
