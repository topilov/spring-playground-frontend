export const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_API_SCHEMA_URL =
  'https://topilov.github.io/spring-playground-backend/openapi/openapi.json';
const DEFAULT_RAW_SCHEMA_URL =
  'https://raw.githubusercontent.com/topilov/spring-playground-backend/main/openapi/openapi.yaml';

function readEnvValue(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function resolveApiBaseUrl(
  value: string | undefined,
  mode: string | undefined
): string {
  const trimmed = value?.trim();

  if (trimmed) {
    return trimmed;
  }

  return mode === 'development' ? DEFAULT_API_BASE_URL : '';
}

export const appConfig = {
  apiBaseUrl: resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL, import.meta.env.MODE),
  apiSchemaUrl: readEnvValue(import.meta.env.VITE_API_SCHEMA_URL, DEFAULT_API_SCHEMA_URL),
  rawSchemaUrl: DEFAULT_RAW_SCHEMA_URL,
} as const;
