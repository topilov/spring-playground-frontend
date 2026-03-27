import type { ApiRequestBody, ApiResponse } from '../../shared/api/contract';

export interface Profile {
  id: number;
  userId: number;
  username: string;
  email: string;
  role: string;
  displayName: string;
  bio: string;
}

export interface UpdateProfileInput {
  displayName: string;
  bio: string;
}

export interface UpdateUsernameInput {
  username: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RequestEmailChangeInput {
  newEmail: string;
}

export interface VerifyEmailChangeInput {
  token: string;
  captchaToken?: string;
}

export type ProfileResponseDto = ApiResponse<'/api/profile/me', 'get'>;
export type UpdateProfileRequestDto = ApiRequestBody<'/api/profile/me', 'put'>;
export type UpdateProfileResponseDto = ApiResponse<'/api/profile/me', 'put'>;
export type UpdateUsernameRequestDto = ApiRequestBody<'/api/profile/me/username', 'post'>;
export type UpdateUsernameResponseDto = ApiResponse<'/api/profile/me/username', 'post'>;
export type ChangePasswordRequestDto = ApiRequestBody<'/api/profile/me/password', 'post'>;
export type ChangePasswordResponseDto = ApiResponse<'/api/profile/me/password', 'post'>;
export type RequestEmailChangeRequestDto = ApiRequestBody<
  '/api/profile/me/email/change-request',
  'post'
>;
export type RequestEmailChangeResponseDto = ApiResponse<
  '/api/profile/me/email/change-request',
  'post'
>;
export type VerifyEmailChangeRequestDto = ApiRequestBody<
  '/api/profile/me/email/verify',
  'post'
>;
export type VerifyEmailChangeResponseDto = ApiResponse<
  '/api/profile/me/email/verify',
  'post'
>;

export function mapProfileResponse(payload: ProfileResponseDto): Profile {
  return { ...payload };
}

export function toUpdateProfileRequest(
  payload: UpdateProfileInput
): UpdateProfileRequestDto {
  return { ...payload };
}

export function toUpdateUsernameRequest(
  payload: UpdateUsernameInput
): UpdateUsernameRequestDto {
  return { ...payload };
}

export function toChangePasswordRequest(
  payload: ChangePasswordInput
): ChangePasswordRequestDto {
  return { ...payload };
}

export function toRequestEmailChangeRequest(
  payload: RequestEmailChangeInput
): RequestEmailChangeRequestDto {
  return { ...payload };
}

export function toVerifyEmailChangeRequest(
  payload: VerifyEmailChangeInput
): VerifyEmailChangeRequestDto {
  return {
    token: payload.token,
    captchaToken: payload.captchaToken,
  };
}
