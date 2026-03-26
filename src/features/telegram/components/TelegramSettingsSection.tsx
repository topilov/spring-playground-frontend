import { useState } from 'react';

import { getTelegramErrorMessage } from '../errors';
import {
  useConfirmTelegramConnectionCodeMutation,
  useConfirmTelegramConnectionPasswordMutation,
  useCreateTelegramAutomationTokenMutation,
  useDisconnectTelegramMutation,
  useRegenerateTelegramAutomationTokenMutation,
  useRevokeTelegramAutomationTokenMutation,
  useStartTelegramConnectionMutation,
  useTelegramSettingsQuery,
  useUpdateTelegramFocusSettingsMutation,
} from '../hooks';
import { telegramFocusModes, type TelegramConnectionState, type TelegramFocusMode, type TelegramSettings } from '../model';
import { TelegramAutomationTokenSection } from './TelegramAutomationTokenSection';
import { TelegramConnectionSection } from './TelegramConnectionSection';
import { TelegramCurrentStateSection } from './TelegramCurrentStateSection';
import { TelegramFocusSettingsSection } from './TelegramFocusSettingsSection';

function deriveConnectionState(settings: TelegramSettings): TelegramConnectionState {
  return {
    connected: settings.connected,
    connectionStatus: settings.connectionStatus,
    telegramUser: settings.telegramUser,
    pendingAuth: settings.pendingAuth,
  };
}

function createEmptyMappings(): Record<TelegramFocusMode, string> {
  return {
    personal: '',
    airplane: '',
    do_not_disturb: '',
    reduce_interruptions: '',
    sleep: '',
  };
}

function deriveFocusForm(settings: TelegramSettings) {
  const mappings = createEmptyMappings();

  for (const mode of telegramFocusModes) {
    mappings[mode] = settings.resolvedEmojiMappings[mode] ?? '';
  }

  return {
    defaultEmojiStatusDocumentId: settings.defaultEmojiStatusDocumentId ?? '',
    mappings,
  };
}

export function TelegramSettingsSection() {
  const settingsQuery = useTelegramSettingsQuery();
  const startConnectionMutation = useStartTelegramConnectionMutation();
  const confirmCodeMutation = useConfirmTelegramConnectionCodeMutation();
  const confirmPasswordMutation = useConfirmTelegramConnectionPasswordMutation();
  const disconnectMutation = useDisconnectTelegramMutation();
  const updateFocusSettingsMutation = useUpdateTelegramFocusSettingsMutation();
  const createTokenMutation = useCreateTelegramAutomationTokenMutation();
  const regenerateTokenMutation = useRegenerateTelegramAutomationTokenMutation();
  const revokeTokenMutation = useRevokeTelegramAutomationTokenMutation();
  const settings = settingsQuery.data;
  const derivedConnectionState = settings ? deriveConnectionState(settings) : null;

  const [connectionStateOverride, setConnectionStateOverride] =
    useState<TelegramConnectionState | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [connectionError, setConnectionError] = useState('');
  const [focusError, setFocusError] = useState('');

  const [tokenError, setTokenError] = useState('');
  const [rawToken, setRawToken] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const connectionState = connectionStateOverride ?? derivedConnectionState;

  const handleStartConnection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedPhoneNumber) {
      setConnectionError('Enter the phone number for the Telegram account.');
      return;
    }

    setConnectionError('');

    try {
      const result = await startConnectionMutation.mutateAsync({
        phoneNumber: trimmedPhoneNumber,
      });
      setConnectionStateOverride(result);
      setPhoneNumber(trimmedPhoneNumber);
      setCode('');
      setPassword('');
    } catch (error) {
      setConnectionError(
        getTelegramErrorMessage(error, 'We could not start the Telegram connection.')
      );
    }
  };

  const handleConfirmCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pendingAuthId = connectionState?.pendingAuth?.pendingAuthId ?? '';
    const trimmedCode = code.trim();

    if (!pendingAuthId || !trimmedCode) {
      setConnectionError('Enter the Telegram login code.');
      return;
    }

    setConnectionError('');

    try {
      const result = await confirmCodeMutation.mutateAsync({
        pendingAuthId,
        code: trimmedCode,
      });
      setConnectionStateOverride(result);
      setCode(trimmedCode);
      setPassword('');
    } catch (error) {
      setConnectionError(
        getTelegramErrorMessage(error, 'We could not confirm that Telegram code.')
      );
    }
  };

  const handleConfirmPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pendingAuthId = connectionState?.pendingAuth?.pendingAuthId ?? '';
    const trimmedPassword = password.trim();

    if (!pendingAuthId || !trimmedPassword) {
      setConnectionError('Enter the Telegram password for that account.');
      return;
    }

    setConnectionError('');

    try {
      const result = await confirmPasswordMutation.mutateAsync({
        pendingAuthId,
        password: trimmedPassword,
      });
      setConnectionStateOverride(result);
      setPassword(trimmedPassword);
      setCode('');
    } catch (error) {
      setConnectionError(
        getTelegramErrorMessage(error, 'We could not confirm that Telegram password.')
      );
    }
  };

  const handleDisconnect = async () => {
    setConnectionError('');

    try {
      await disconnectMutation.mutateAsync(undefined);
      setConnectionStateOverride({
        connected: false,
        connectionStatus: 'DISCONNECTED',
        telegramUser: null,
        pendingAuth: null,
      });
      setPhoneNumber('');
      setCode('');
      setPassword('');
    } catch (error) {
      setConnectionError(
        getTelegramErrorMessage(error, 'We could not disconnect Telegram right now.')
      );
    }
  };

  const handleFocusSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    values: {
      defaultEmojiStatusDocumentId: string;
      mappings: Record<TelegramFocusMode, string>;
    }
  ) => {
    event.preventDefault();
    setFocusError('');

    try {
      await updateFocusSettingsMutation.mutateAsync({
        defaultEmojiStatusDocumentId: values.defaultEmojiStatusDocumentId.trim(),
        mappings: Object.fromEntries(
          telegramFocusModes.map((mode) => [mode, values.mappings[mode].trim()])
        ) as Record<TelegramFocusMode, string>,
      });
    } catch (error) {
      setFocusError(
        getTelegramErrorMessage(error, 'We could not save the Telegram focus settings.')
      );
    }
  };

  const handleCreateToken = async () => {
    setTokenError('');
    setCopyStatus('');

    try {
      const result = await createTokenMutation.mutateAsync(undefined);
      setRawToken(result.token);
    } catch (error) {
      setTokenError(
        getTelegramErrorMessage(error, 'We could not create the Telegram automation token.')
      );
    }
  };

  const handleRegenerateToken = async () => {
    setTokenError('');
    setCopyStatus('');

    try {
      const result = await regenerateTokenMutation.mutateAsync(undefined);
      setRawToken(result.token);
    } catch (error) {
      setTokenError(
        getTelegramErrorMessage(
          error,
          'We could not regenerate the Telegram automation token.'
        )
      );
    }
  };

  const handleRevokeToken = async () => {
    setTokenError('');
    setCopyStatus('');

    try {
      await revokeTokenMutation.mutateAsync(undefined);
      setRawToken('');
    } catch (error) {
      setTokenError(
        getTelegramErrorMessage(error, 'We could not revoke the Telegram automation token.')
      );
    }
  };

  const handleCopyToken = async () => {
    if (!rawToken) {
      return;
    }

    await navigator.clipboard.writeText(rawToken);
    setCopyStatus('Token copied.');
  };

  if (settingsQuery.isLoading) {
    return (
      <section className="workspace-band stack">
        <p className="page-description">Loading Telegram settings...</p>
      </section>
    );
  }

  if (settingsQuery.isError || !settings || !connectionState) {
    return (
      <section className="workspace-band stack">
        <p className="status-banner status-error" role="alert">
          {getTelegramErrorMessage(
            settingsQuery.error,
            'We could not load the Telegram settings.'
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="stack">
      <TelegramConnectionSection
        actionError={connectionError}
        code={code}
        connectionState={connectionState}
        isConfirmingCode={confirmCodeMutation.isPending}
        isConfirmingPassword={confirmPasswordMutation.isPending}
        isDisconnecting={disconnectMutation.isPending}
        isStarting={startConnectionMutation.isPending}
        onCodeChange={setCode}
        onConfirmCode={handleConfirmCode}
        onConfirmPassword={handleConfirmPassword}
        onDisconnect={handleDisconnect}
        onPasswordChange={setPassword}
        onPhoneNumberChange={setPhoneNumber}
        onStart={handleStartConnection}
        password={password}
        phoneNumber={phoneNumber}
      />

      <TelegramFocusSettingsSection
        actionError={focusError}
        initialDefaultEmojiStatusDocumentId={deriveFocusForm(settings).defaultEmojiStatusDocumentId}
        initialMappings={deriveFocusForm(settings).mappings}
        isSaving={updateFocusSettingsMutation.isPending}
        key={JSON.stringify(deriveFocusForm(settings))}
        onSubmit={handleFocusSubmit}
      />

      <TelegramAutomationTokenSection
        actionError={tokenError}
        automationToken={settings.automationToken}
        copyStatus={copyStatus}
        isCreating={createTokenMutation.isPending}
        isRegenerating={regenerateTokenMutation.isPending}
        isRevoking={revokeTokenMutation.isPending}
        onCopy={handleCopyToken}
        onCreate={handleCreateToken}
        onRegenerate={handleRegenerateToken}
        onRevoke={handleRevokeToken}
        rawToken={rawToken}
      />

      <TelegramCurrentStateSection settings={settings} />
    </section>
  );
}
