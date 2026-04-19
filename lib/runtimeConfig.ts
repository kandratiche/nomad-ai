type NullableString = string | null | undefined;

function readEnv(key: string): string | undefined {
  const value = process.env[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseBoolean(value: NullableString, fallback = false): boolean {
  if (!value) return fallback;
  const normalized = value.toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

function parseNumber(value: NullableString, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export const runtimeConfig = {
  backendBaseUrl: trimTrailingSlash(readEnv("EXPO_PUBLIC_BACKEND_BASE_URL") || "http://10.0.2.2:8080"),
  backendApiPrefix: readEnv("EXPO_PUBLIC_BACKEND_API_PREFIX") || "/api/v1",
  backendTimeoutMs: parseNumber(readEnv("EXPO_PUBLIC_BACKEND_TIMEOUT_MS"), 15_000),
  chatPollIntervalMs: parseNumber(readEnv("EXPO_PUBLIC_CHAT_POLL_INTERVAL_MS"), 4_000),
  useBackendApi: parseBoolean(readEnv("EXPO_PUBLIC_USE_BACKEND_API"), false),
};

export function buildBackendPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const prefix = runtimeConfig.backendApiPrefix.startsWith("/")
    ? runtimeConfig.backendApiPrefix
    : `/${runtimeConfig.backendApiPrefix}`;
  return `${prefix}${normalizedPath}`;
}
