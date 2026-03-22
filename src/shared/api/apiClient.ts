import { appConfig } from '../config/appConfig';
import { isJsonContentType } from '../lib/http';
import type { ApiClientErrorDetails, RequestOptions } from '../types/api';

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value)
  );
}

export function buildApiUrl(path: string, apiBaseUrl: string = appConfig.apiBaseUrl): string {
  if (!apiBaseUrl) {
    return path;
  }

  return new URL(path, `${apiBaseUrl}/`).toString();
}

function buildHeaders(headers: HeadersInit | undefined, csrfToken: string | undefined): Headers {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json');
  }

  if (csrfToken) {
    requestHeaders.set('X-CSRF-Token', csrfToken);
  }

  return requestHeaders;
}

function serializeBody(body: RequestOptions['body'], headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const contentType = response.headers.get('Content-Type');
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  if (isJsonContentType(contentType)) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly responseBody?: unknown;

  constructor(details: ApiClientErrorDetails) {
    super(`Request failed with status ${details.status}`);
    this.name = 'ApiClientError';
    this.status = details.status;
    this.statusText = details.statusText;
    this.url = details.url;
    this.responseBody = details.responseBody;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildApiUrl(path);
  const headers = buildHeaders(options.headers, options.csrfToken);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    credentials: 'include',
    headers,
    body: serializeBody(options.body, headers),
    signal: options.signal,
  });
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      statusText: response.statusText,
      url,
      responseBody,
    });
  }

  return responseBody as T;
}
