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

export type ProfileResponseDto = ApiResponse<'/api/profile/me', 'get'>;
export type UpdateProfileRequestDto = ApiRequestBody<'/api/profile/me', 'put'>;
export type UpdateProfileResponseDto = ApiResponse<'/api/profile/me', 'put'>;

export function mapProfileResponse(payload: ProfileResponseDto): Profile {
  return { ...payload };
}

export function toUpdateProfileRequest(
  payload: UpdateProfileInput
): UpdateProfileRequestDto {
  return { ...payload };
}
