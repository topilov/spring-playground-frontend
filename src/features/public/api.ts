import { mapPublicPingResponse, type PublicPing } from '../../entities/public/model';
import { request } from '../../shared/api/apiClient';

export function ping(): Promise<PublicPing> {
  return request<PublicPing>('/api/public/ping').then(mapPublicPingResponse);
}
