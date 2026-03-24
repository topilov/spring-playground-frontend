import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  RenamePasskeyInput,
  StartPasskeyLoginInput,
  StartPasskeyRegistrationInput,
} from '../../entities/passkey/model';
import {
  deletePasskey,
  finishPasskeyLogin,
  finishPasskeyRegistration,
  listPasskeys,
  renamePasskey,
  startPasskeyLogin,
  startPasskeyRegistration,
} from './api';
import {
  createRegistrationCredential,
  getAuthenticationCredential,
} from './webauthn';
import { authSessionQueryKey, fetchAuthSession } from '../auth/session/query';

export const passkeysQueryKey = ['auth', 'passkeys'] as const;

export function usePasskeysQuery() {
  return useQuery({
    queryKey: passkeysQueryKey,
    queryFn: listPasskeys,
    staleTime: 30_000,
  });
}

export function useRegisterPasskeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartPasskeyRegistrationInput) => {
      const ceremony = await startPasskeyRegistration(payload);
      const credential = await createRegistrationCredential(ceremony.publicKey);

      return finishPasskeyRegistration({
        ceremonyId: ceremony.ceremonyId,
        credential,
        nickname: payload.nickname,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: passkeysQueryKey,
      });
    },
  });
}

export function useRenamePasskeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RenamePasskeyInput) => renamePasskey(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: passkeysQueryKey,
      });
    },
  });
}

export function useDeletePasskeyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePasskey(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: passkeysQueryKey,
      });
    },
  });
}

export function usePasskeyLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StartPasskeyLoginInput) => {
      const ceremony = await startPasskeyLogin(payload);
      const credential = await getAuthenticationCredential(ceremony.publicKey);

      return finishPasskeyLogin({
        ceremonyId: ceremony.ceremonyId,
        credential,
        captchaToken: payload.captchaToken,
      });
    },
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: authSessionQueryKey,
        queryFn: fetchAuthSession,
        staleTime: 0,
      });
    },
  });
}
