const DEFAULT_API_BASE_URL = 'http://localhost:8080';
const DEFAULT_API_SCHEMA_URL =
  'https://topilov.github.io/spring-playground-backend/openapi/openapi.json';
const DEFAULT_RAW_SCHEMA_URL =
  'https://raw.githubusercontent.com/topilov/spring-playground-backend/main/openapi/openapi.yaml';

function readEnvValue(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export const appConfig = {
  apiBaseUrl: readEnvValue(import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  apiSchemaUrl: readEnvValue(import.meta.env.VITE_API_SCHEMA_URL, DEFAULT_API_SCHEMA_URL),
  rawSchemaUrl: DEFAULT_RAW_SCHEMA_URL,
} as const;
