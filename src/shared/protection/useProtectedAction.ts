import { useRef, useState } from 'react';

import { getProtectionResultFromError } from './contract';
import { TURNSTILE_INCOMPLETE_MESSAGE } from './turnstile/useTurnstileController';
import type { ProtectionResult } from './types';

const TURNSTILE_FAILURE_MESSAGE =
  'We could not verify that you are human. Please try again.';

interface UseProtectedActionOptions {
  enabled: boolean;
  acquireToken: () => Promise<string>;
  reset: () => void;
}

interface ProtectedExecutionOptions<T> {
  execute: (captchaToken: string | undefined) => Promise<T>;
}

interface UseProtectedActionResult {
  errorMessage: string | null;
  execute: <T>(options: ProtectedExecutionOptions<T>) => Promise<T>;
  protection: ProtectionResult | null;
  resetStatus: () => void;
  wasHandledError: (error: unknown) => boolean;
}

function safeReset(reset: () => void): void {
  try {
    reset();
  } catch {
    // Cleanup is best-effort and must not replace the real action outcome.
  }
}

export function useProtectedAction({
  enabled,
  acquireToken,
  reset,
}: UseProtectedActionOptions): UseProtectedActionResult {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [protection, setProtection] = useState<ProtectionResult | null>(null);
  const handledErrorRef = useRef<unknown>(null);

  async function execute<T>({ execute: run }: ProtectedExecutionOptions<T>): Promise<T> {
    setErrorMessage(null);
    setProtection(null);
    handledErrorRef.current = null;

    let captchaToken: string | undefined;

    if (enabled) {
      try {
        captchaToken = await acquireToken();
      } catch (error) {
        const message =
          error instanceof Error && error.message === TURNSTILE_INCOMPLETE_MESSAGE
            ? TURNSTILE_INCOMPLETE_MESSAGE
            : TURNSTILE_FAILURE_MESSAGE;
        setErrorMessage(message);
        const handledError = new Error(message);
        handledErrorRef.current = handledError;
        throw handledError;
      }
    }

    try {
      const result = await run(captchaToken);
      if (enabled) {
        safeReset(reset);
      }
      return result;
    } catch (error) {
      const protectionResult = getProtectionResultFromError(error);

      if (protectionResult) {
        setProtection(protectionResult);
        handledErrorRef.current = error;
      }

      if (enabled) {
        safeReset(reset);
      }

      throw error;
    }
  }

  return {
    errorMessage,
    execute,
    protection,
    resetStatus() {
      setErrorMessage(null);
      setProtection(null);
      handledErrorRef.current = null;
    },
    wasHandledError(error) {
      return handledErrorRef.current === error;
    },
  };
}

export { TURNSTILE_FAILURE_MESSAGE };
