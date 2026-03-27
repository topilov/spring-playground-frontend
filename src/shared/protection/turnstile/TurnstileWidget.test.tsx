/* @vitest-environment jsdom */

import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ensureTurnstileScript } from './TurnstileScript';
import { TurnstileWidget } from './TurnstileWidget';
import { useTurnstileController } from './useTurnstileController';

const renderMock = vi.fn();
const resetMock = vi.fn();

function TestHarness() {
  const controller = useTurnstileController();

  return (
    <>
      <div data-testid="ready">{String(controller.isReady)}</div>
      <button type="button" onClick={() => controller.reset()}>
        Reset
      </button>
      <TurnstileWidget controller={controller} siteKey="site-key-123" />
    </>
  );
}

describe('TurnstileWidget', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    document.head.innerHTML = '';
  });

  it('reports readiness after the widget runtime is attached', async () => {
    renderMock.mockReturnValue('widget-id');
    vi.stubGlobal('turnstile', {
      render: renderMock,
      reset: resetMock,
    });

    const { getByTestId } = render(<TestHarness />);

    await waitFor(() => {
      expect(getByTestId('ready').textContent).toBe('true');
    });
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(renderMock.mock.calls[0]?.[1]).toMatchObject({
      execution: 'render',
    });
  });

  it('forwards reset requests to the turnstile runtime', async () => {
    renderMock.mockReturnValue('widget-id');
    vi.stubGlobal('turnstile', {
      render: renderMock,
      reset: resetMock,
    });

    const { getByRole } = render(<TestHarness />);

    await waitFor(() => {
      expect(renderMock).toHaveBeenCalledTimes(1);
    });

    getByRole('button', { name: 'Reset' }).click();

    expect(resetMock).toHaveBeenCalledWith('widget-id');
  });

  it('resolves when a matching script tag is already present and already loaded', async () => {
    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    Object.defineProperty(script, 'readyState', {
      configurable: true,
      value: 'complete',
    });
    document.head.append(script);

    await expect(ensureTurnstileScript()).resolves.toBeUndefined();
  });

  it('renders nothing when captcha protection is disabled for local development', async () => {
    vi.resetModules();
    vi.doMock('../../config/appConfig', () => ({
      appConfig: {
        turnstileSiteKey: '',
        captchaRequired: false,
      },
    }));

    const { TurnstileWidget: DisabledTurnstileWidget } = await import('./TurnstileWidget');
    const controller = {
      acquireToken: vi.fn(),
      reset: vi.fn(),
      isReady: false,
      attach: vi.fn(),
      detach: vi.fn(),
      handleError: vi.fn(),
      handleExpired: vi.fn(),
      handleToken: vi.fn(),
    };

    const { container } = render(
      <DisabledTurnstileWidget controller={controller} siteKey="" />
    );

    expect(container.innerHTML).toBe('');
    expect(controller.handleError).not.toHaveBeenCalled();
  });
});
