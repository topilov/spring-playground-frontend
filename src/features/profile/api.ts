import {
  mapProfileResponse,
  type Profile,
  toUpdateProfileRequest,
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
