function readEnvValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ?? '';
}

function readOptionalBoolean(value: string | undefined): boolean | undefined {
  const normalized = readEnvValue(value).toLowerCase();

  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return undefined;
}

export function resolveApiBaseUrl(value: string | undefined): string {
  return readEnvValue(value);
}

export function resolveCaptchaRequired(
  mode: string | undefined,
  value: string | undefined
): boolean {
  const configured = readOptionalBoolean(value);

  if (mode === 'production') {
    return true;
  }

  return configured ?? true;
}

const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);
const captchaRequired = resolveCaptchaRequired(
  import.meta.env.MODE,
  import.meta.env.VITE_AUTH_CAPTCHA_REQUIRED
);

console.info('[appConfig] VITE_API_BASE_URL', {
  value: import.meta.env.VITE_API_BASE_URL,
  resolved: apiBaseUrl,
});

export const appConfig = {
  apiBaseUrl,
  apiSchemaUrl: readEnvValue(import.meta.env.VITE_API_SCHEMA_URL),
  rawSchemaUrl: readEnvValue(import.meta.env.VITE_RAW_SCHEMA_URL),
  turnstileSiteKey: readEnvValue(import.meta.env.VITE_TURNSTILE_SITE_KEY),
  captchaRequired,
} as const;
