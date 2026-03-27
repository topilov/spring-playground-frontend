import { useEffect, useRef } from 'react';

import { appConfig } from '../../config/appConfig';
import {
  ensureTurnstileScript,
  type TurnstileRuntime,
  type TurnstileWidgetId,
} from './TurnstileScript';
import type { TurnstileController } from './useTurnstileController';

interface TurnstileWidgetProps {
  controller: TurnstileController;
  siteKey?: string;
}

function readTurnstileRuntime(): TurnstileRuntime | undefined {
  return window.turnstile ?? globalThis.turnstile;
}

export function TurnstileWidget({
  controller,
  siteKey = appConfig.turnstileSiteKey,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isDisposed = false;
    let widgetId: TurnstileWidgetId | null = null;

    if (!appConfig.captchaRequired) {
      return undefined;
    }

    if (!siteKey) {
      controller.handleError(new Error('Turnstile site key is not configured.'));
      return undefined;
    }

    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    ensureTurnstileScript()
      .then(() => {
        if (isDisposed) {
          return;
        }

        const runtime = readTurnstileRuntime();

        if (!runtime) {
          controller.handleError(new Error('Turnstile runtime is unavailable.'));
          return;
        }

        widgetId = runtime.render(container, {
          sitekey: siteKey,
          execution: 'render',
          callback: (token) => controller.handleToken(token),
          'error-callback': () => controller.handleError(),
          'expired-callback': () => controller.handleExpired(),
        });

        controller.attach(runtime, widgetId);
      })
      .catch((error: unknown) => {
        controller.handleError(error);
      });

    return () => {
      isDisposed = true;

      const runtime = readTurnstileRuntime();

      if (runtime && widgetId && runtime.remove) {
        runtime.remove(widgetId);
      }

      controller.detach();
    };
  }, [controller, siteKey]);

  if (!appConfig.captchaRequired) {
    return null;
  }

  return <div aria-live="polite" ref={containerRef} />;
}
