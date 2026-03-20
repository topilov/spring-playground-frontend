import { useQuery } from '@tanstack/react-query';

import { ping } from './api';

export function usePublicPing() {
  return useQuery({
    queryKey: ['public', 'ping'],
    queryFn: ping,
    retry: false,
    staleTime: 60_000,
  });
}
