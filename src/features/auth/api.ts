import type {
  ForgotPasswordInput,
  ForgotPasswordResult,
  RegisterInput,
  RegisterResult,
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
