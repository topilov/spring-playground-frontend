import {
  mapForgotPasswordResponse,
  mapResetPasswordResponse,
  mapRegisterResponse,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type ResetPasswordInput,
  type ResetPasswordResult,
  type RegisterInput,
  type RegisterResult,
  toForgotPasswordRequest,
  toResetPasswordRequest,
  toRegisterRequest,
} from '../../entities/auth/model';
import {
  mapLoginResponse,
  type LoginCredentials,
  type SessionUser,
  toLoginRequest,
} from '../../entities/session/model';
import { request } from '../../shared/api/apiClient';

export function register(payload: RegisterInput): Promise<RegisterResult> {
  return request<RegisterResult>('/api/auth/register', {
    method: 'POST',
    body: toRegisterRequest(payload),
  }).then(mapRegisterResponse);
}

export function forgotPassword(
  payload: ForgotPasswordInput
): Promise<ForgotPasswordResult> {
  return request<ForgotPasswordResult>('/api/auth/forgot-password', {
    method: 'POST',
    body: toForgotPasswordRequest(payload),
  }).then(mapForgotPasswordResponse);
}

export function resetPassword(
  payload: ResetPasswordInput
): Promise<ResetPasswordResult> {
  return request<ResetPasswordResult>('/api/auth/reset-password', {
    method: 'POST',
    body: toResetPasswordRequest(payload),
  }).then(mapResetPasswordResponse);
}

export function login(payload: LoginCredentials): Promise<SessionUser> {
  return request<SessionUser>('/api/auth/login', {
    method: 'POST',
    body: toLoginRequest(payload),
  }).then(mapLoginResponse);
}

export function logout(): Promise<void> {
  return request<void>('/api/auth/logout', {
    method: 'POST',
  });
}
