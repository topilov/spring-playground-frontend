/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiClientError, buildApiUrl } from '../../../shared/api/apiClient';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const useForgotPasswordMutationMock = vi.fn();
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
  useForgotPasswordMutation: () => useForgotPasswordMutationMock(),
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
    statusText: status === 429 ? 'Too Many Requests' : 'Bad Request',
    url: buildApiUrl('/api/auth/forgot-password'),
    responseBody,
  });
}

function renderForm() {
  return render(
    <MemoryRouter>
      <ForgotPasswordForm />
    </MemoryRouter>
  );
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    turnstileController.acquireToken.mockResolvedValue('captcha-token');
    turnstileController.reset.mockClear();
    useForgotPasswordMutationMock.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders turnstile inline and submits forgot-password requests with a captcha token', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ accepted: true });

    useForgotPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    expect(screen.getByTestId('turnstile-widget')).toBeTruthy();

    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: 'demo@example.com',
        captchaToken: 'captcha-token',
      });
    });
  });

  it('keeps the generic accepted UX after a successful request', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockResolvedValue({ accepted: true });

    useForgotPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(
      await screen.findByText('If that address exists, you will receive a reset link.')
    ).toBeTruthy();
  });

  it('shows the shared calm protection message for rate limits', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockRejectedValue(
      buildApiError(429, {
        error: 'Too many requests.',
        code: 'RATE_LIMITED',
        retryAfterSeconds: 60,
      })
    );

    useForgotPasswordMutationMock.mockReturnValue({
      mutateAsync,
      isPending: false,
    });

    renderForm();

    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(
      await screen.findByText('Try again in 1 minute.')
    ).toBeTruthy();
  });
});
