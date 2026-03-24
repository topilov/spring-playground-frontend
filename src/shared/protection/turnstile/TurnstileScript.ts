const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export type TurnstileWidgetId = string;

export interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  execution?: 'execute' | 'render';
}

export interface TurnstileRuntime {
  render(container: HTMLElement, options: TurnstileRenderOptions): TurnstileWidgetId;
  execute(widgetId: TurnstileWidgetId): void;
  reset(widgetId: TurnstileWidgetId): void;
  remove?(widgetId: TurnstileWidgetId): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileRuntime;
  }

  var turnstile: TurnstileRuntime | undefined;
}

let turnstileScriptPromise: Promise<void> | null = null;

function getExistingScript(): HTMLScriptElement | null {
  return document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
}

function isLoadedScript(script: HTMLScriptElement): boolean {
  const readyState = Reflect.get(script, 'readyState');

  return script.dataset.loaded === 'true' || readyState === 'complete' || readyState === 'loaded';
}

export function getTurnstileRuntime(): TurnstileRuntime | undefined {
  return window.turnstile ?? globalThis.turnstile;
}

export function ensureTurnstileScript(): Promise<void> {
  if (getTurnstileRuntime()) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existingScript = getExistingScript();
    const handleLoad = () => {
      const script = getExistingScript();

      if (script) {
        script.dataset.loaded = 'true';
      }

      resolve();
    };
    const handleError = () => {
      turnstileScriptPromise = null;
      reject(new Error('Failed to load the Turnstile script.'));
    };

    if (existingScript) {
      if (isLoadedScript(existingScript)) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.append(script);
  });

  return turnstileScriptPromise;
}
