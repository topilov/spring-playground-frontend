/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PasskeySection } from './PasskeySection';

const usePasskeysQueryMock = vi.fn();
const useRegisterPasskeyMutationMock = vi.fn();
const useRenamePasskeyMutationMock = vi.fn();
const useDeletePasskeyMutationMock = vi.fn();

vi.mock('../hooks', () => ({
  usePasskeysQuery: () => usePasskeysQueryMock(),
  useRegisterPasskeyMutation: () => useRegisterPasskeyMutationMock(),
  useRenamePasskeyMutation: () => useRenamePasskeyMutationMock(),
  useDeletePasskeyMutation: () => useDeletePasskeyMutationMock(),
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
      <PasskeySection />
    </QueryClientProvider>
  );
}

describe('PasskeySection', () => {
  beforeEach(() => {
    usePasskeysQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    useRegisterPasskeyMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useRenamePasskeyMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
    useDeletePasskeyMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a clean empty state when the user has no passkeys', () => {
    renderSection();

    expect(screen.getByRole('heading', { name: 'Passkeys' })).toBeTruthy();
    expect(
      screen.getByText('No passkeys added yet. Add one to sign in faster on supported devices.')
    ).toBeTruthy();
  });

  it('renders the current passkeys with metadata', () => {
    usePasskeysQueryMock.mockReturnValue({
      data: [
        {
          id: 10,
          name: 'Work Laptop',
          createdAt: '2026-03-21T10:15:30Z',
          lastUsedAt: '2026-03-21T12:05:00Z',
          deviceHint: 'platform',
          transports: ['internal'],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    renderSection();

    expect(screen.getByText('Work Laptop')).toBeTruthy();
    expect(screen.getByText(/Created/i)).toBeTruthy();
    expect(screen.getByText(/Last used/i)).toBeTruthy();
    expect(screen.getByText(/platform/i)).toBeTruthy();
  });

  it('starts passkey registration from the add form', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      id: 10,
      name: 'Desk Mac',
    });

    useRegisterPasskeyMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    await user.type(screen.getByLabelText('Passkey name'), 'Desk Mac');
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        nickname: 'Desk Mac',
      });
    });
  });

  it('renames a listed passkey', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      id: 10,
      name: 'Desk Mac',
    });

    usePasskeysQueryMock.mockReturnValue({
      data: [
        {
          id: 10,
          name: 'Work Laptop',
          createdAt: '2026-03-21T10:15:30Z',
          lastUsedAt: null,
          deviceHint: 'platform',
          transports: ['internal'],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });
    useRenamePasskeyMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    await user.click(screen.getByRole('button', { name: 'Rename Work Laptop' }));
    await user.clear(screen.getByLabelText('New passkey name'));
    await user.type(screen.getByLabelText('New passkey name'), 'Desk Mac');
    await user.click(screen.getByRole('button', { name: 'Save name' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: 10,
        name: 'Desk Mac',
      });
    });
  });

  it('confirms before deleting a passkey', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    usePasskeysQueryMock.mockReturnValue({
      data: [
        {
          id: 10,
          name: 'Work Laptop',
          createdAt: '2026-03-21T10:15:30Z',
          lastUsedAt: null,
          deviceHint: 'platform',
          transports: ['internal'],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });
    useDeletePasskeyMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    await user.click(screen.getByRole('button', { name: 'Delete Work Laptop' }));
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(10);
    });
  });
});
