import {
  type ChangePasswordInput,
  type ChangePasswordResponseDto,
  mapProfileResponse,
  type Profile,
  type RequestEmailChangeInput,
  type RequestEmailChangeResponseDto,
  toChangePasswordRequest,
  toRequestEmailChangeRequest,
  toUpdateProfileRequest,
  toUpdateUsernameRequest,
  toVerifyEmailChangeRequest,
  type UpdateUsernameInput,
  type UpdateUsernameResponseDto,
  type VerifyEmailChangeInput,
  type VerifyEmailChangeResponseDto,
  type UpdateProfileInput,
} from '../../entities/profile/model';
import { request } from '../../shared/api/apiClient';

export function getCurrentProfile(): Promise<Profile> {
  return request<Profile>('/api/profile/me').then(mapProfileResponse);
}

export function updateCurrentProfile(payload: UpdateProfileInput): Promise<Profile> {
  return request<Profile>('/api/profile/me', {
    method: 'PUT',
    body: toUpdateProfileRequest(payload),
  }).then(mapProfileResponse);
}

export function updateCurrentUsername(payload: UpdateUsernameInput): Promise<Profile> {
  return request<UpdateUsernameResponseDto>('/api/profile/me/username', {
    method: 'POST',
    body: toUpdateUsernameRequest(payload),
  }).then(mapProfileResponse);
}

export function changeCurrentPassword(
  payload: ChangePasswordInput
): Promise<ChangePasswordResponseDto> {
  return request<ChangePasswordResponseDto>('/api/profile/me/password', {
    method: 'POST',
    body: toChangePasswordRequest(payload),
  });
}

export function requestCurrentEmailChange(
  payload: RequestEmailChangeInput
): Promise<RequestEmailChangeResponseDto> {
  return request<RequestEmailChangeResponseDto>('/api/profile/me/email/change-request', {
    method: 'POST',
    body: toRequestEmailChangeRequest(payload),
  });
}

export function verifyCurrentEmailChange(
  payload: VerifyEmailChangeInput
): Promise<Profile> {
  return request<VerifyEmailChangeResponseDto>('/api/profile/me/email/verify', {
    method: 'POST',
    body: toVerifyEmailChangeRequest(payload),
  }).then(mapProfileResponse);
}
