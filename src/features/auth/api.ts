import type { LoginCredentials, SessionUser } from '../../entities/session/model';
import { request } from '../../shared/api/apiClient';

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
