import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  RegisterInput,
} from '../../entities/auth/model';
import type { LoginCredentials } from '../../entities/session/model';
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  register,
} from './api';
import { authSessionQueryKey, fetchAuthSession } from './session/query';

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterInput) => register(payload),
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) => forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => resetPassword(payload),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginCredentials) => login(payload),
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: authSessionQueryKey,
        queryFn: fetchAuthSession,
        staleTime: 0,
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(authSessionQueryKey, {
        kind: 'anonymous',
        profile: null,
      });
    },
  });
}
