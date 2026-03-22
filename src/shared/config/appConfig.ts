function readEnvValue(value: string | undefined): string {
  const trimmed = value?.trim();
  return trimmed ?? '';
}

export function resolveApiBaseUrl(value: string | undefined): string {
  return readEnvValue(value);
}

const apiBaseUrl = resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

console.info('[appConfig] VITE_API_BASE_URL', {
  value: import.meta.env.VITE_API_BASE_URL,
  resolved: apiBaseUrl,
});

export const appConfig = {
  apiBaseUrl,
  apiSchemaUrl: readEnvValue(import.meta.env.VITE_API_SCHEMA_URL),
  rawSchemaUrl: readEnvValue(import.meta.env.VITE_RAW_SCHEMA_URL),
} as const;
