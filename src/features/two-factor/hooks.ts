import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ConfirmTwoFactorSetupInput,
  VerifyTwoFactorBackupCodeLoginInput,
  VerifyTwoFactorLoginInput,
} from '../../entities/twoFactor/model';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  getTwoFactorStatus,
  regenerateBackupCodes,
  startTwoFactorSetup,
  verifyTwoFactorBackupCodeLogin,
  verifyTwoFactorLogin,
} from './api';
import { authSessionQueryKey, fetchAuthSession } from '../auth/session/query';

export const twoFactorStatusQueryKey = ['auth', 'two-factor', 'status'] as const;

export function useTwoFactorStatusQuery() {
  return useQuery({
    queryKey: twoFactorStatusQueryKey,
    queryFn: getTwoFactorStatus,
    staleTime: 30_000,
  });
}

export function useStartTwoFactorSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => startTwoFactorSetup(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorStatusQueryKey,
      });
    },
  });
}

export function useConfirmTwoFactorSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmTwoFactorSetupInput) => confirmTwoFactorSetup(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorStatusQueryKey,
      });
    },
  });
}

export function useRegenerateBackupCodesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => regenerateBackupCodes(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorStatusQueryKey,
      });
    },
  });
}

export function useDisableTwoFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disableTwoFactor(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: twoFactorStatusQueryKey,
      });
    },
  });
}

export function useVerifyTwoFactorLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyTwoFactorLoginInput) => verifyTwoFactorLogin(payload),
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: authSessionQueryKey,
        queryFn: fetchAuthSession,
        staleTime: 0,
      });
    },
  });
}

export function useVerifyTwoFactorBackupCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyTwoFactorBackupCodeLoginInput) =>
      verifyTwoFactorBackupCodeLogin(payload),
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: authSessionQueryKey,
        queryFn: fetchAuthSession,
        staleTime: 0,
      });
    },
  });
}
