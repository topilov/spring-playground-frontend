/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../../shared/api/apiClient';
import { RegisterForm } from './RegisterForm';

const useRegisterMutationMock = vi.fn();
const turnstileController = {
  acquireToken: vi.fn(),
  reset: vi.fn(),
  isReady: true,
  attach: vi.fn(),
  detach: vi.fn(),
  handleError: vi.fn(),
  handleExpired: vi.fn(),
  handleToken: vi.fn(),
};

vi.mock('../mutations', () => ({
  useRegisterMutation: () => useRegisterMutationMock(),
}));

vi.mock('../../../shared/protection/turnstile/useTurnstileController', () => ({
  useTurnstileController: () => turnstileController,
}));

vi.mock('../../../shared/protection/turnstile/TurnstileWidget', () => ({
  TurnstileWidget: () => <div data-testid="turnstile-widget">Turnstile widget</div>,
}));

function buildApiError(status: number, responseBody: unknown) {
  return new ApiClientError({
    status,
    statusText: 'Bad Request',
    url: buildApiUrl('/api/auth/register'),
    responseBody,
  });
}

function renderForm() {
  return render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
    useRegisterMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders turnstile inline and submits registration with a captcha token', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({
      userId: 1,
      username: 'demo',
      email: 'demo@example.com',
    });

    useRegisterMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();

    await user.type(screen.getByLabelText('Username'), 'demo-user');
    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'very-secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        username: 'demo-user',
        email: 'demo@example.com',
        password: 'very-secret',
        captchaToken: 'captcha-token',
      });
    });
  });

  it('shows the shared calm protection message for captcha failures', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(400, {
        error: 'Captcha validation failed.',
        code: 'CAPTCHA_INVALID',
      })
    );

    useRegisterMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.type(screen.getByLabelText('Username'), 'demo-user');
    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'very-secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(
      await screen.findByText('Please try the verification again before submitting.')
    ).toBeTruthy();
  });
});
