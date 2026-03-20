import type { ApiResponse } from '../../shared/api/contract';

export interface PublicPing {
  status: string;
}

export type PublicPingResponseDto = ApiResponse<'/api/public/ping', 'get'>;

export function mapPublicPingResponse(payload: PublicPingResponseDto): PublicPing {
  return { ...payload };
}
