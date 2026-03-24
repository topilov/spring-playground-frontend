import { request } from '../../shared/api/apiClient';
import {
  mapPasskeyLoginOptionsResponse,
  mapPasskeyLoginVerifyResponse,
  mapPasskeyRegistrationOptionsResponse,
  mapPasskeyRegistrationVerifyResponse,
  mapPasskeysResponse,
  mapRenamePasskeyResponse,
  toPasskeyLoginOptionsRequest,
  toPasskeyLoginVerifyRequest,
  toPasskeyRegistrationOptionsRequest,
  toPasskeyRegistrationVerifyRequest,
  toRenamePasskeyRequest,
  type FinishPasskeyLoginInput,
  type FinishPasskeyRegistrationInput,
  type Passkey,
  type PasskeysResponseDto,
  type PasskeyLoginOptionsResponseDto,
  type PasskeyRegistrationCeremony,
  type PasskeyRegistrationOptionsResponseDto,
  type PasskeyRegistrationVerifyResponseDto,
  type RenamePasskeyInput,
  type RenamePasskeyResponseDto,
  type StartPasskeyLoginInput,
  type StartPasskeyRegistrationInput,
} from '../../entities/passkey/model';
import type { LoginSuccessResponseDto, SessionUser } from '../../entities/session/model';

export function listPasskeys(): Promise<Passkey[]> {
  return request<PasskeysResponseDto>('/api/auth/passkeys').then(mapPasskeysResponse);
}

export function startPasskeyRegistration(
  payload: StartPasskeyRegistrationInput
): Promise<PasskeyRegistrationCeremony> {
  return request<PasskeyRegistrationOptionsResponseDto>(
    '/api/auth/passkeys/register/options',
    {
      method: 'POST',
      body: toPasskeyRegistrationOptionsRequest(payload),
    }
  ).then(mapPasskeyRegistrationOptionsResponse);
}

export function finishPasskeyRegistration(
  payload: FinishPasskeyRegistrationInput
): Promise<Passkey> {
  return request<PasskeyRegistrationVerifyResponseDto>(
    '/api/auth/passkeys/register/verify',
    {
      method: 'POST',
      body: toPasskeyRegistrationVerifyRequest(payload),
    }
  ).then(mapPasskeyRegistrationVerifyResponse);
}

export function renamePasskey(payload: RenamePasskeyInput): Promise<Passkey> {
  return request<RenamePasskeyResponseDto>(`/api/auth/passkeys/${payload.id}`, {
    method: 'PATCH',
    body: toRenamePasskeyRequest(payload),
  }).then(mapRenamePasskeyResponse);
}

export function deletePasskey(id: number): Promise<void> {
  return request<void>(`/api/auth/passkeys/${id}`, {
    method: 'DELETE',
  });
}

export function startPasskeyLogin(
  payload: StartPasskeyLoginInput = {}
): Promise<PasskeyRegistrationCeremony> {
  return request<PasskeyLoginOptionsResponseDto>(
    '/api/auth/passkey-login/options',
    {
      method: 'POST',
      body: toPasskeyLoginOptionsRequest(payload),
    }
  ).then(mapPasskeyLoginOptionsResponse);
}

export function finishPasskeyLogin(
  payload: FinishPasskeyLoginInput
): Promise<SessionUser> {
  return request<LoginSuccessResponseDto>('/api/auth/passkey-login/verify', {
    method: 'POST',
    body: toPasskeyLoginVerifyRequest(payload),
  }).then(mapPasskeyLoginVerifyResponse);
}
