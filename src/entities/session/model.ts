import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface SessionUser {
  authenticated: boolean;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export type LoginRequestDto = ApiRequestBody<'/api/auth/login', 'post'>;
export type LoginResponseDto = ApiResponse<'/api/auth/login', 'post'>;

export function toLoginRequest(payload: LoginCredentials): LoginRequestDto {
  return { ...payload };
}

export function mapLoginResponse(payload: LoginResponseDto): SessionUser {
  return { ...payload };
}
