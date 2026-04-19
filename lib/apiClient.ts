import { runtimeConfig } from "@/lib/runtimeConfig";
import { getAccessToken } from "@/lib/authSession";

type Primitive = string | number | boolean;
type QueryValue = Primitive | Primitive[] | undefined | null;
type QueryParams = Record<string, QueryValue>;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildQueryString(query?: QueryParams): string {
  if (!query) return "";

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    params.append(key, String(value));
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

async function buildAuthHeader(enabled: boolean): Promise<Record<string, string>> {
  if (!enabled) return {};

  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type RequestOptions<TBody> = {
  body?: TBody;
  query?: QueryParams;
  auth?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
};

async function request<TResponse, TBody = unknown>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const queryString = buildQueryString(options.query);
  const urlBase = isAbsoluteUrl(path) ? path : `${runtimeConfig.backendBaseUrl}${path}`;
  const url = `${urlBase}${queryString}`;

  const timeoutMs = options.timeoutMs ?? runtimeConfig.backendTimeoutMs;
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);

  const authHeaders = await buildAuthHeader(options.auth !== false);
  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
    ...authHeaders,
    ...options.headers,
  };

  const hasBody = options.body !== undefined;
  if (hasBody) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const signal = options.signal || timeoutController.signal;

  try {
    const response = await fetch(url, {
      method,
      headers: baseHeaders,
      signal,
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    const rawText = await response.text();
    const payload = rawText ? safeJsonParse(rawText) : null;

    if (!response.ok) {
      const message = extractErrorMessage(payload) || `Request failed with ${response.status}`;
      throw new ApiError(message, response.status, payload);
    }

    return payload as TResponse;
  } finally {
    clearTimeout(timer);
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function extractErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;

  const message = record.message;
  if (typeof message === "string" && message.trim().length > 0) return message;

  const error = record.error;
  if (typeof error === "string" && error.trim().length > 0) return error;

  return undefined;
}

export const apiClient = {
  get: <TResponse>(path: string, options?: Omit<RequestOptions<never>, "body">) =>
    request<TResponse>("GET", path, options),
  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "body">) =>
    request<TResponse, TBody>("POST", path, { ...options, body }),
  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "body">) =>
    request<TResponse, TBody>("PUT", path, { ...options, body }),
  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options?: Omit<RequestOptions<TBody>, "body">) =>
    request<TResponse, TBody>("PATCH", path, { ...options, body }),
  delete: <TResponse>(path: string, options?: Omit<RequestOptions<never>, "body">) =>
    request<TResponse>("DELETE", path, options),
};
