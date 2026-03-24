import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  RegisterInput,
  ResendVerificationEmailInput,
  VerifyEmailInput,
} from '../../entities/auth/model';
import {
  isTwoFactorLoginChallenge,
  type LoginCredentials,
} from '../../entities/session/model';
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  register,
  resendVerificationEmail,
  verifyEmail,
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

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (payload: VerifyEmailInput) => verifyEmail(payload),
  });
}

export function useResendVerificationEmailMutation() {
  return useMutation({
    mutationFn: (payload: ResendVerificationEmailInput) =>
      resendVerificationEmail(payload),
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginCredentials) => login(payload),
    onSuccess: async (result) => {
      if (isTwoFactorLoginChallenge(result)) {
        return;
      }

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
