import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';
import {
  mapLoginResponse,
  type SessionUser,
  type LoginResponseDto,
} from '../session/model';

export interface Passkey {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  deviceHint: string | null;
  transports: string[];
}

export interface StartPasskeyRegistrationInput {
  nickname?: string;
}

export interface FinishPasskeyRegistrationInput {
  ceremonyId: string;
  credential: Record<string, unknown>;
  nickname?: string;
}

export interface PasskeyRegistrationCeremony {
  ceremonyId: string;
  publicKey: Record<string, unknown>;
}

export interface StartPasskeyLoginInput {
  usernameOrEmail?: string;
}

export interface FinishPasskeyLoginInput {
  ceremonyId: string;
  credential: Record<string, unknown>;
}

export interface RenamePasskeyInput {
  id: number;
  name: string;
}

export type PasskeyRegistrationOptionsRequestDto = ApiRequestBody<
  '/api/auth/passkeys/register/options',
  'post'
>;
export type PasskeyRegistrationOptionsResponseDto = ApiResponse<
  '/api/auth/passkeys/register/options',
  'post'
>;
export type PasskeyRegistrationVerifyRequestDto = ApiRequestBody<
  '/api/auth/passkeys/register/verify',
  'post'
>;
export type PasskeyRegistrationVerifyResponseDto = ApiResponse<
  '/api/auth/passkeys/register/verify',
  'post'
>;
export type PasskeysResponseDto = ApiResponse<'/api/auth/passkeys', 'get'>;
export type RenamePasskeyRequestDto = ApiRequestBody<'/api/auth/passkeys/{id}', 'patch'>;
export type RenamePasskeyResponseDto = ApiResponse<'/api/auth/passkeys/{id}', 'patch'>;
export type PasskeyLoginOptionsRequestDto = ApiRequestBody<
  '/api/auth/passkey-login/options',
  'post'
>;
export type PasskeyLoginOptionsResponseDto = ApiResponse<
  '/api/auth/passkey-login/options',
  'post'
>;
export type PasskeyLoginVerifyRequestDto = ApiRequestBody<
  '/api/auth/passkey-login/verify',
  'post'
>;
export type PasskeyLoginVerifyResponseDto = ApiResponse<
  '/api/auth/passkey-login/verify',
  'post'
>;

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function mapPasskeyResponse(
  payload: PasskeyRegistrationVerifyResponseDto | RenamePasskeyResponseDto
): Passkey {
  return {
    id: payload.id,
    name: payload.name,
    createdAt: payload.createdAt,
    lastUsedAt: payload.lastUsedAt ?? null,
    deviceHint: payload.deviceHint ?? null,
    transports: payload.transports ?? [],
  };
}

export function toPasskeyRegistrationOptionsRequest(
  payload: StartPasskeyRegistrationInput
): PasskeyRegistrationOptionsRequestDto {
  const nickname = normalizeOptionalString(payload.nickname);
  return nickname ? { nickname } : {};
}

export function mapPasskeyRegistrationOptionsResponse(
  payload: PasskeyRegistrationOptionsResponseDto
): PasskeyRegistrationCeremony {
  return {
    ceremonyId: payload.ceremonyId,
    publicKey: payload.publicKey as Record<string, unknown>,
  };
}

export function toPasskeyRegistrationVerifyRequest(
  payload: FinishPasskeyRegistrationInput
): PasskeyRegistrationVerifyRequestDto {
  const nickname = normalizeOptionalString(payload.nickname);

  return {
    ceremonyId: payload.ceremonyId,
    credential: payload.credential,
    ...(nickname ? { nickname } : {}),
  };
}

export function mapPasskeyRegistrationVerifyResponse(
  payload: PasskeyRegistrationVerifyResponseDto
): Passkey {
  return mapPasskeyResponse(payload);
}

export function mapPasskeysResponse(
  payload: PasskeysResponseDto | undefined
): Passkey[] {
  if (payload === undefined) {
    return [];
  }

  return payload.map((item) => mapPasskeyResponse(item));
}

export function toRenamePasskeyRequest(
  payload: RenamePasskeyInput
): RenamePasskeyRequestDto {
  return {
    name: payload.name.trim(),
  };
}

export function mapRenamePasskeyResponse(payload: RenamePasskeyResponseDto): Passkey {
  return mapPasskeyResponse(payload);
}

export function toPasskeyLoginOptionsRequest(
  payload: StartPasskeyLoginInput
): PasskeyLoginOptionsRequestDto {
  const usernameOrEmail = normalizeOptionalString(payload.usernameOrEmail);
  return usernameOrEmail ? { usernameOrEmail } : {};
}

export function mapPasskeyLoginOptionsResponse(
  payload: PasskeyLoginOptionsResponseDto
): PasskeyRegistrationCeremony {
  return {
    ceremonyId: payload.ceremonyId,
    publicKey: payload.publicKey as Record<string, unknown>,
  };
}

export function toPasskeyLoginVerifyRequest(
  payload: FinishPasskeyLoginInput
): PasskeyLoginVerifyRequestDto {
  return {
    ceremonyId: payload.ceremonyId,
    credential: payload.credential,
  };
}

export function mapPasskeyLoginVerifyResponse(
  payload: LoginResponseDto | PasskeyLoginVerifyResponseDto
): SessionUser {
  return mapLoginResponse(payload);
}
