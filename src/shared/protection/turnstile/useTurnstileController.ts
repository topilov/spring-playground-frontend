import { useRef, useState, type MutableRefObject } from 'react';

import type { TurnstileRuntime, TurnstileWidgetId } from './TurnstileScript';

interface PendingTokenRequest {
  promise: Promise<string>;
  reject: (error: unknown) => void;
  resolve: (token: string) => void;
}

export interface TurnstileController {
  readonly isReady: boolean;
  acquireToken(): Promise<string>;
  reset(): void;
  attach(runtime: TurnstileRuntime, widgetId: TurnstileWidgetId): void;
  detach(): void;
  handleError(error?: unknown): void;
  handleExpired(): void;
  handleToken(token: string): void;
}

function rejectPendingTokenRequest(
  pendingTokenRequestRef: MutableRefObject<PendingTokenRequest | null>,
  error: unknown
) {
  pendingTokenRequestRef.current?.reject(error);
  pendingTokenRequestRef.current = null;
}

export function useTurnstileController(): TurnstileController {
  const [isReady, setIsReady] = useState(false);
  const isReadyRef = useRef(isReady);
  const runtimeRef = useRef<TurnstileRuntime | null>(null);
  const tokenRef = useRef<string | null>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);
  const pendingTokenRequestRef = useRef<PendingTokenRequest | null>(null);
  const controllerRef = useRef<TurnstileController | null>(null);

  isReadyRef.current = isReady;

  if (!controllerRef.current) {
    controllerRef.current = {
      get isReady() {
        return isReadyRef.current;
      },
      async acquireToken() {
        if (tokenRef.current) {
          return tokenRef.current;
        }

        const runtime = runtimeRef.current;
        const widgetId = widgetIdRef.current;

        if (!runtime || !widgetId) {
          throw new Error('Turnstile is not ready.');
        }

        if (pendingTokenRequestRef.current) {
          return pendingTokenRequestRef.current.promise;
        }

        let resolveToken!: (token: string) => void;
        let rejectToken!: (error: unknown) => void;
        const promise = new Promise<string>((resolve, reject) => {
          resolveToken = resolve;
          rejectToken = reject;
        });

        pendingTokenRequestRef.current = {
          promise,
          reject: rejectToken,
          resolve: resolveToken,
        };

        try {
          runtime.execute(widgetId);
        } catch (error) {
          rejectPendingTokenRequest(pendingTokenRequestRef, error);
        }

        return promise;
      },
      reset() {
        tokenRef.current = null;
        rejectPendingTokenRequest(
          pendingTokenRequestRef,
          new Error('Turnstile token request was reset.')
        );

        const runtime = runtimeRef.current;
        const widgetId = widgetIdRef.current;

        if (runtime && widgetId) {
          runtime.reset(widgetId);
        }
      },
      attach(runtime, widgetId) {
        runtimeRef.current = runtime;
        widgetIdRef.current = widgetId;
        setIsReady(true);
      },
      detach() {
        tokenRef.current = null;
        runtimeRef.current = null;
        widgetIdRef.current = null;
        rejectPendingTokenRequest(
          pendingTokenRequestRef,
          new Error('Turnstile widget is no longer available.')
        );
        setIsReady(false);
      },
      handleError(error) {
        tokenRef.current = null;
        rejectPendingTokenRequest(
          pendingTokenRequestRef,
          error ?? new Error('Turnstile verification failed.')
        );
      },
      handleExpired() {
        tokenRef.current = null;
        rejectPendingTokenRequest(
          pendingTokenRequestRef,
          new Error('Turnstile verification expired.')
        );
      },
      handleToken(token) {
        tokenRef.current = token;
        pendingTokenRequestRef.current?.resolve(token);
        pendingTokenRequestRef.current = null;
      },
    };
  }

  return controllerRef.current;
}
