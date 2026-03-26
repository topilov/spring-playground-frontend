import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmTelegramConnectionCode,
  confirmTelegramConnectionPassword,
  createTelegramAutomationToken,
  disconnectTelegram,
  getTelegramSettings,
  regenerateTelegramAutomationToken,
  revokeTelegramAutomationToken,
  startTelegramConnection,
  updateTelegramFocusSettings,
} from './api';
import type {
  ConfirmTelegramConnectionCodeInput,
  ConfirmTelegramConnectionPasswordInput,
  StartTelegramConnectionInput,
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

export function useCreateTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => createTelegramAutomationToken());
}

export function useRegenerateTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => regenerateTelegramAutomationToken());
}

export function useRevokeTelegramAutomationTokenMutation() {
  return useTelegramInvalidatingMutation(() => revokeTelegramAutomationToken());
}
