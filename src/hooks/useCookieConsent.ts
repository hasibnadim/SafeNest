"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "cookie-consent";
const DATE_KEY = "cookie-consent-date";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

// localStorage is an external store, so subscribe to it rather than copying its
// value into state from an effect.
function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const getServerSnapshot = () => null;

// `false` while server-rendering/hydrating, `true` once the client is mounted.
const subscribeToNothing = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export function useCookieConsent() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isLoaded = useSyncExternalStore(
    subscribeToNothing,
    getClientTrue,
    getServerFalse
  );

  const preferences = useMemo<CookiePreferences | null>(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CookiePreferences;
    } catch (error) {
      console.error("Error parsing cookie preferences:", error);
      return null;
    }
  }, [raw]);

  const updatePreferences = useCallback((newPreferences: CookiePreferences) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
    window.localStorage.setItem(DATE_KEY, new Date().toISOString());
    emit();
  }, []);

  const hasConsent = useCallback(
    (type: keyof CookiePreferences): boolean => {
      if (!preferences) return false;
      return preferences[type];
    },
    [preferences]
  );

  const clearConsent = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(DATE_KEY);
    emit();
  }, []);

  const getConsentDate = useCallback((): Date | null => {
    const dateString = window.localStorage.getItem(DATE_KEY);
    return dateString ? new Date(dateString) : null;
  }, []);

  return {
    preferences,
    isLoaded,
    updatePreferences,
    hasConsent,
    clearConsent,
    getConsentDate,
  };
}
