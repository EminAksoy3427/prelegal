import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "prelegal.user";

/**
 * The user "signed in" through the fake login screen. Kept in sessionStorage
 * purely so the platform can greet them; there is no real authentication yet.
 */
export interface SessionUser {
  id: number;
  name: string;
  email: string;
}

export function saveSessionUser(user: SessionUser): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable (e.g. blocked by privacy settings).
  }
}

export function clearSessionUser(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // See saveSessionUser.
  }
}

function readStoredUser(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// sessionStorage doesn't notify the tab that wrote it, so there's nothing to
// subscribe to; pages read the stored user once when they mount.
const subscribe = () => () => {};

/**
 * Returns the signed-in user, `null` when nobody is signed in, or `undefined`
 * while prerendering and hydrating, before sessionStorage can be read.
 */
export function useSessionUser(): SessionUser | null | undefined {
  const raw = useSyncExternalStore(subscribe, readStoredUser, () => undefined);
  return useMemo(() => {
    if (raw === undefined || raw === null) return raw;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }, [raw]);
}
