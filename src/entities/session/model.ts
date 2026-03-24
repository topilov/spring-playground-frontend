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

export interface TwoFactorLoginChallenge {
  requiresTwoFactor: true;
  loginChallengeId: string;
  methods: string[];
  expiresAt: string;
}

export type LoginRequestDto = ApiRequestBody<'/api/auth/login', 'post'>;
export type LoginResponseDto = ApiResponse<'/api/auth/login', 'post'>;
export type LoginSuccessResponseDto = ApiResponse<'/api/auth/login', 'post', 200>;
export type LoginChallengeResponseDto = ApiResponse<'/api/auth/login', 'post', 202>;
export type LoginResult = SessionUser | TwoFactorLoginChallenge;

export function toLoginRequest(payload: LoginCredentials): LoginRequestDto {
  return { ...payload };
}

export function mapLoginResponse(payload: LoginResponseDto): LoginResult {
  if ('requiresTwoFactor' in payload) {
    return {
      requiresTwoFactor: true,
      loginChallengeId: payload.loginChallengeId,
      methods: payload.methods,
      expiresAt: payload.expiresAt,
    };
  }

  return { ...payload };
}

export function isTwoFactorLoginChallenge(
  payload: LoginResult
): payload is TwoFactorLoginChallenge {
  return 'requiresTwoFactor' in payload;
}
