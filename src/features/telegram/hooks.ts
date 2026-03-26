import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmTelegramConnectionCode,
  confirmTelegramConnectionPassword,
  createTelegramAutomationToken,
  createTelegramMode,
  deleteTelegramMode,
  disconnectTelegram,
  getTelegramSettings,
  regenerateTelegramAutomationToken,
  revokeTelegramAutomationToken,
  startTelegramConnection,
  updateTelegramMode,
  updateTelegramFocusSettings,
} from './api';
import type {
  ConfirmTelegramConnectionCodeInput,
  ConfirmTelegramConnectionPasswordInput,
  CreateTelegramModeInput,
  StartTelegramConnectionInput,
  UpdateTelegramModeInput,
  UpdateTelegramFocusSettingsInput,
} from './model';

export const telegramSettingsQueryKey = ['settings', 'telegram'] as const;

export function useTelegramSettingsQuery() {
  return useQuery({
    queryKey: telegramSettingsQueryKey,
    queryFn: getTelegramSettings,
    staleTime: 30_000,
  });
}

function useTelegramInvalidatingMutation<TVariables, TData>(
  mutationFn: (payload: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: telegramSettingsQueryKey,
      });
    },
  });
}

export function useStartTelegramConnectionMutation() {
  return useTelegramInvalidatingMutation(
    (payload: StartTelegramConnectionInput) => startTelegramConnection(payload)
  );
}

export function useConfirmTelegramConnectionCodeMutation() {
  return useTelegramInvalidatingMutation(
    (payload: ConfirmTelegramConnectionCodeInput) =>
      confirmTelegramConnectionCode(payload)
  );
}

export function useConfirmTelegramConnectionPasswordMutation() {
  return useTelegramInvalidatingMutation(
    (payload: ConfirmTelegramConnectionPasswordInput) =>
      confirmTelegramConnectionPassword(payload)
  );
}

export function useDisconnectTelegramMutation() {
  return useTelegramInvalidatingMutation(() => disconnectTelegram());
}

export function useUpdateTelegramFocusSettingsMutation() {
  return useTelegramInvalidatingMutation(
    (payload: UpdateTelegramFocusSettingsInput) => updateTelegramFocusSettings(payload)
  );
}

export function useCreateTelegramModeMutation() {
  return useTelegramInvalidatingMutation(
    (payload: CreateTelegramModeInput) => createTelegramMode(payload)
  );
}

export function useUpdateTelegramModeMutation() {
  return useTelegramInvalidatingMutation(
    (payload: UpdateTelegramModeInput) => updateTelegramMode(payload)
  );
}

export function useDeleteTelegramModeMutation() {
  return useTelegramInvalidatingMutation((mode: string) => deleteTelegramMode(mode));
}

export function useCreateTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => createTelegramAutomationToken());
}

export function useRegenerateTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => regenerateTelegramAutomationToken());
}

export function useRevokeTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => revokeTelegramAutomationToken());
}
