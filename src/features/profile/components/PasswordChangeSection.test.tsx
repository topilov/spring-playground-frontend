/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PasswordChangeSection } from './PasswordChangeSection';

const changeCurrentPasswordMock = vi.fn();

vi.mock('../api', () => ({
  changeCurrentPassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => changeCurrentPasswordMock(payload),
}));

describe('PasswordChangeSection', () => {
  beforeEach(() => {
    changeCurrentPasswordMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows a validation error when confirmation does not match', async () => {
    const user = userEvent.setup();

    render(<PasswordChangeSection />);

    await user.type(screen.getByLabelText('Current password'), 'old-password');
    await user.type(screen.getByLabelText('New password'), 'new-password-123');
    await user.type(screen.getByLabelText('Confirm new password'), 'different-password');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Passwords must match.');
    expect(changeCurrentPasswordMock).not.toHaveBeenCalled();
  });

  it('submits the password change payload and resets after success', async () => {
    const user = userEvent.setup();

    changeCurrentPasswordMock.mockResolvedValue({
      changed: true,
    });

    render(<PasswordChangeSection />);

    await user.type(screen.getByLabelText('Current password'), 'old-password');
    await user.type(screen.getByLabelText('New password'), 'new-password-123');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password-123');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => {
      expect(changeCurrentPasswordMock).toHaveBeenCalledWith({
        currentPassword: 'old-password',
        newPassword: 'new-password-123',
      });
    });

    expect(await screen.findByText('Password updated.')).toBeTruthy();
    expect((screen.getByLabelText('Current password') as HTMLInputElement).value).toBe('');
  });

  it('shows an api error when the backend rejects the password change', async () => {
    const user = userEvent.setup();

    changeCurrentPasswordMock.mockRejectedValue(new Error('Current password is incorrect.'));

    render(<PasswordChangeSection />);

    await user.type(screen.getByLabelText('Current password'), 'wrong-password');
    await user.type(screen.getByLabelText('New password'), 'new-password-123');
    await user.type(screen.getByLabelText('Confirm new password'), 'new-password-123');
    await user.click(screen.getByRole('button', { name: 'Change password' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Current password is incorrect.'
    );
  });
});
