/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TwoFactorSection } from './TwoFactorSection';

const useTwoFactorStatusQueryMock = vi.fn();
const useStartTwoFactorSetupMutationMock = vi.fn();
const useConfirmTwoFactorSetupMutationMock = vi.fn();
const useRegenerateBackupCodesMutationMock = vi.fn();
const useDisableTwoFactorMutationMock = vi.fn();

vi.mock('../hooks', () => ({
  useTwoFactorStatusQuery: () => useTwoFactorStatusQueryMock(),
  useStartTwoFactorSetupMutation: () => useStartTwoFactorSetupMutationMock(),
  useConfirmTwoFactorSetupMutation: () => useConfirmTwoFactorSetupMutationMock(),
  useRegenerateBackupCodesMutation: () => useRegenerateBackupCodesMutationMock(),
  useDisableTwoFactorMutation: () => useDisableTwoFactorMutationMock(),
}));

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <TwoFactorSection />
    </QueryClientProvider>
  );
}

describe('TwoFactorSection', () => {
  beforeEach(() => {
    useTwoFactorStatusQueryMock.mockReturnValue({
      data: {
        enabled: false,
        pendingSetup: false,
        backupCodesRemaining: 0,
        enabledAt: null,
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    useStartTwoFactorSetupMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useConfirmTwoFactorSetupMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useRegenerateBackupCodesMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useDisableTwoFactorMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows the setup prompt when totp is not enabled', () => {
    renderSection();

    expect(screen.getByRole('heading', { name: 'Two-factor authentication' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start setup' })).toBeTruthy();
  });

  it('starts setup and reveals the setup key and otpauth uri', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUri:
        'otpauth://totp/Spring%20Playground:demo%40example.com?secret=JBSWY3DPEHPK3PXP',
    });

    useStartTwoFactorSetupMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    await user.click(screen.getByRole('button', { name: 'Start setup' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByDisplayValue('JBSWY3DPEHPK3PXP')).toBeTruthy();
    expect(
      screen.getByDisplayValue(
        'otpauth://totp/Spring%20Playground:demo%40example.com?secret=JBSWY3DPEHPK3PXP'
      )
    ).toBeTruthy();
  });

  it('confirms setup with a totp code and shows the issued backup codes', async () => {
    const user = userEvent.setup();
    const startSetup = vi.fn().mockResolvedValue({
      secret: 'JBSWY3DPEHPK3PXP',
      otpauthUri:
        'otpauth://totp/Spring%20Playground:demo%40example.com?secret=JBSWY3DPEHPK3PXP',
    });
    const confirmSetup = vi.fn().mockResolvedValue({
      enabled: true,
      backupCodes: ['ABCD-EFGH-JKLM', 'MNPR-STUV-WXYZ'],
    });

    useStartTwoFactorSetupMutationMock.mockReturnValue({
      mutateAsync: startSetup,
      isPending: false,
    });
    useConfirmTwoFactorSetupMutationMock.mockReturnValue({
      mutateAsync: confirmSetup,
      isPending: false,
    });

    renderSection();

    await user.click(screen.getByRole('button', { name: 'Start setup' }));
    await screen.findByDisplayValue('JBSWY3DPEHPK3PXP');

    await user.type(screen.getByLabelText('Verification code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Enable two-factor authentication' }));

    await waitFor(() => {
      expect(confirmSetup).toHaveBeenCalledWith({
        code: '123456',
      });
    });

    expect(await screen.findByText('ABCD-EFGH-JKLM')).toBeTruthy();
    expect(screen.getByText('MNPR-STUV-WXYZ')).toBeTruthy();
  });

  it('shows enabled status and supports backup code regeneration and disable', async () => {
    const user = userEvent.setup();
    const regenerate = vi.fn().mockResolvedValue({
      backupCodes: ['ZXCV-BNMQ-POIU'],
    });
    const disable = vi.fn().mockResolvedValue({
      disabled: true,
    });

    useTwoFactorStatusQueryMock.mockReturnValue({
      data: {
        enabled: true,
        pendingSetup: false,
        backupCodesRemaining: 5,
        enabledAt: '2026-03-24T10:20:00Z',
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    useRegenerateBackupCodesMutationMock.mockReturnValue({
      mutateAsync: regenerate,
      isPending: false,
    });
    useDisableTwoFactorMutationMock.mockReturnValue({
      mutateAsync: disable,
      isPending: false,
    });

    renderSection();

    expect(screen.getByText('Enabled')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Regenerate backup codes' }));

    await waitFor(() => {
      expect(regenerate).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('ZXCV-BNMQ-POIU')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Disable two-factor authentication' }));

    await waitFor(() => {
      expect(disable).toHaveBeenCalledTimes(1);
    });
  });
});
