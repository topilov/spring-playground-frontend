export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiClientErrorDetails {
  status: number;
  statusText: string;
  url: string;
  responseBody?: unknown;
}

export interface RequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown>;
  signal?: AbortSignal;
  csrfToken?: string;
}
