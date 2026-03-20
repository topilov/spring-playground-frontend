import type {
  ForgotPasswordInput,
  ForgotPasswordResult,
  ResendVerificationEmailInput,
  ResendVerificationEmailResult,
  RegisterInput,
  RegisterResult,
  VerifyEmailInput,
  VerifyEmailResult,
} from '../../entities/auth/model';
import type { LoginCredentials, SessionUser } from '../../entities/session/model';
import { request } from '../../shared/api/apiClient';

export function register(payload: RegisterInput): Promise<RegisterResult> {
  return request<RegisterResult>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function forgotPassword(
  payload: ForgotPasswordInput
): Promise<ForgotPasswordResult> {
  return request<ForgotPasswordResult>('/api/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

export function verifyEmail(payload: VerifyEmailInput): Promise<VerifyEmailResult> {
  return request<VerifyEmailResult>('/api/auth/verify-email', {
    method: 'POST',
    body: payload,
  });
}

export function resendVerificationEmail(
  payload: ResendVerificationEmailInput
): Promise<ResendVerificationEmailResult> {
  return request<ResendVerificationEmailResult>(
    '/api/auth/resend-verification-email',
    {
      method: 'POST',
      body: payload,
    }
  );
}

export function login(payload: LoginCredentials): Promise<SessionUser> {
  return request<SessionUser>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function logout(): Promise<void> {
  return request<void>('/api/auth/logout', {
    method: 'POST',
  });
}
