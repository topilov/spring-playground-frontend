/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
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
    expect(screen.getByText('No passkeys yet.')).toBeTruthy();
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

  it('trims the passkey nickname and clears the field after a successful registration', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      id: 11,
      name: 'Desk Mac',
    });

    useRegisterPasskeyMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    const nameField = screen.getByLabelText('Passkey name');

    await user.type(nameField, '  Desk Mac  ');
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        nickname: 'Desk Mac',
      });
    });
    await waitFor(() => {
      expect((screen.getByLabelText('Passkey name') as HTMLInputElement).value).toBe('');
    });
  });

  it('shows an action error when registration fails', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Passkey registration failed.'));

    useRegisterPasskeyMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderSection();

    await user.type(screen.getByLabelText('Passkey name'), 'Desk Mac');
    await user.click(screen.getByRole('button', { name: 'Add passkey' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Passkey registration failed.');
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
    await user.clear(screen.getByLabelText('New name'));
    await user.type(screen.getByLabelText('New name'), 'Desk Mac');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        id: 10,
        name: 'Desk Mac',
      });
    });
  });

  it('shows a validation error when renaming to a blank name', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn();

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
    await user.clear(screen.getByLabelText('New name'));
    await user.type(screen.getByLabelText('New name'), '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Enter a name for this passkey.'
    );
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('cancels the rename form without affecting the passkey list', async () => {
    const user = userEvent.setup();

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

    renderSection();

    await user.click(screen.getByRole('button', { name: 'Rename Work Laptop' }));
    expect((screen.getByLabelText('New name') as HTMLInputElement).value).toBe('Work Laptop');

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByLabelText('New name')).toBeNull();
    expect(screen.getByText('Work Laptop')).toBeTruthy();
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
    await user.click(screen.getByRole('button', { name: 'Delete passkey' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(10);
    });
  });

  it('cancels deletion without calling the delete mutation', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn();

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
    expect(
      screen.getByText('This passkey will no longer work for this account.')
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(
      screen.queryByText('This passkey will no longer work for this account.')
    ).toBeNull();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('shows a loading state without exposing the empty state', () => {
    usePasskeysQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    renderSection();

    expect(screen.getByText('Loading passkeys...')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('No passkeys yet.')).toBeNull();
  });

  it('shows a query error state without exposing the empty state', () => {
    usePasskeysQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Passkeys are temporarily unavailable.'),
    });

    renderSection();

    expect(screen.getByRole('alert').textContent).toContain(
      'Passkeys are temporarily unavailable.'
    );
    expect(screen.queryByText('Loading passkeys...')).toBeNull();
    expect(screen.queryByText('No passkeys yet.')).toBeNull();
  });

  it('keeps rename and delete actions available for each listed passkey', () => {
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
        {
          id: 11,
          name: 'Phone',
          createdAt: '2026-03-22T10:15:30Z',
          lastUsedAt: '2026-03-23T10:15:30Z',
          deviceHint: 'cross-platform',
          transports: ['hybrid', 'internal'],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
    });

    renderSection();

    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');

    expect(within(items[0]).getByRole('button', { name: 'Rename Work Laptop' })).toBeTruthy();
    expect(within(items[0]).getByRole('button', { name: 'Delete Work Laptop' })).toBeTruthy();
    expect(within(items[1]).getByRole('button', { name: 'Rename Phone' })).toBeTruthy();
    expect(within(items[1]).getByRole('button', { name: 'Delete Phone' })).toBeTruthy();
  });
});
