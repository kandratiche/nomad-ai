import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_STORAGE_KEY = "nomad_backend_session_v1";

export type BackendSession = {
  accessToken: string;
  user: any | null;
};

let memorySession: BackendSession | null = null;

export async function saveSession(session: BackendSession): Promise<void> {
  memorySession = session;
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<BackendSession | null> {
  if (memorySession) return memorySession;

  const raw = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BackendSession;
    if (!parsed?.accessToken) return null;
    memorySession = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken || null;
}

export async function setSessionUser(user: any): Promise<void> {
  const session = await getSession();
  if (!session) return;
  const next: BackendSession = { ...session, user };
  await saveSession(next);
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  await AsyncStorage.removeItem(SESSION_STORAGE_KEY);
}

