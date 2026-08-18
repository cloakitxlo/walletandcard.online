import { AuthUser } from '../types';

const SESSION_KEY = 'wc_auth_session_v1';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface StoredSession {
  user: AuthUser;
  activeTab: string;
  expiresAt: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSession(): StoredSession | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed?.user?.id || !parsed.expiresAt) {
      clearSession();
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(user: AuthUser, activeTab: string): void {
  if (!isBrowser()) return;
  const payload: StoredSession = {
    user,
    activeTab,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  } catch {
    // ignore quota / private mode
  }
}

/** Extend expiry while the user is actively using the app. */
export function touchSession(patch?: Partial<Pick<StoredSession, 'user' | 'activeTab'>>): void {
  if (!isBrowser()) return;
  const current = loadSession();
  if (!current) return;
  saveSession(patch?.user ?? current.user, patch?.activeTab ?? current.activeTab);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
