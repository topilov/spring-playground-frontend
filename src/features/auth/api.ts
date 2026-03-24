import {
  mapForgotPasswordResponse,
  mapResetPasswordResponse,
  mapRegisterResponse,
  mapResendVerificationEmailResponse,
  mapVerifyEmailResponse,
  type ForgotPasswordInput,
  type ForgotPasswordResult,
  type ResetPasswordInput,
  type ResetPasswordResult,
  type RegisterInput,
  type RegisterResult,
  type ResendVerificationEmailInput,
  type ResendVerificationEmailResult,
  toForgotPasswordRequest,
  toResetPasswordRequest,
  toRegisterRequest,
  toResendVerificationEmailRequest,
  toVerifyEmailRequest,
  type VerifyEmailInput,
  type VerifyEmailResult,
} from '../../entities/auth/model';
import {
  mapLoginResponse,
  type LoginCredentials,
  type LoginResponseDto,
  type LoginResult,
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

export function verifyEmail(payload: VerifyEmailInput): Promise<VerifyEmailResult> {
  return request<VerifyEmailResult>('/api/auth/verify-email', {
    method: 'POST',
    body: toVerifyEmailRequest(payload),
  }).then(mapVerifyEmailResponse);
}

export function resendVerificationEmail(
  payload: ResendVerificationEmailInput
): Promise<ResendVerificationEmailResult> {
  return request<ResendVerificationEmailResult>(
    '/api/auth/resend-verification-email',
    {
      method: 'POST',
      body: toResendVerificationEmailRequest(payload),
    }
  ).then(mapResendVerificationEmailResponse);
}

export function login(payload: LoginCredentials): Promise<LoginResult> {
  return request<LoginResponseDto>('/api/auth/login', {
    method: 'POST',
    body: toLoginRequest(payload),
  }).then(mapLoginResponse);
}

export function logout(): Promise<void> {
  return request<void>('/api/auth/logout', {
    method: 'POST',
  });
}
