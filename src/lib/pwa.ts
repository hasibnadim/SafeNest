/**
 * Shared state for the browser's PWA install flow, in the same
 * subscribe/read/server-snapshot shape the theme store uses, so any component
 * can read it with `useSyncExternalStore`.
 *
 * Behaviour: `beforeinstallprompt` is captured once (its default is prevented
 * so Chrome's own mini info bar stays away), the big prompt shows it on
 * phone/tablet until dismissed, and dismissal lasts only for the current
 * visit — landing on the site again starts the flow over. Nothing is written
 * to storage on purpose. The install UI lives in the header (pill on
 * desktop, compact button on phone/tablet) plus the phone/tablet sheet.
 */

type InstallState = {
  /** The browser captured an install event that has not been consumed yet. */
  ready: boolean;
  /** The big prompt was closed for this visit; the header button takes over. */
  dismissed: boolean;
  /** Already running installed (standalone display mode or `appinstalled`). */
  installed: boolean;
};

type InstallPromptEvent = Event & { prompt: () => Promise<void> };

const initialState: InstallState = {
  ready: false,
  dismissed: false,
  installed: false,
};

let state: InstallState = initialState;
let deferredPrompt: InstallPromptEvent | null = null;
let attached = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes the flag on navigator instead of a media query.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;

  if (isStandalone()) {
    state = { ...state, installed: true };
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    // Prevent Chrome's mini info bar; this app shows its own prompt UI.
    event.preventDefault();
    deferredPrompt = event as InstallPromptEvent;
    state = { ...state, ready: true };
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    state = { ready: false, dismissed: false, installed: true };
    emit();
  });
}

export function subscribeToPwaInstall(listener: () => void): () => void {
  attach();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readPwaInstall(): InstallState {
  return state;
}

export function serverPwaInstall(): InstallState {
  return initialState;
}

/** Close the big prompt for this visit; the header button takes over. */
export function dismissPwaPrompt(): void {
  state = { ...state, dismissed: true };
  emit();
}

/**
 * Fire the native install dialog. The event is one-shot per session, so the
 * state is marked consumed either way; `appinstalled` flips `installed` when
 * the user follows through.
 */
export async function promptPwaInstall(): Promise<void> {
  const prompt = deferredPrompt;
  deferredPrompt = null;
  state = { ...state, ready: false, dismissed: true };
  emit();
  if (!prompt) return;
  try {
    await prompt.prompt();
  } catch {
    // The dialog is best-effort; a rejected prompt just means no install.
  }
}

/**
 * Phone/tablet detection for the install UI: small screens or a coarse
 * (touch) pointer count as compact. The server snapshot is `false` so the
 * prompt never renders from markup — it only attaches on the client.
 */
const COMPACT_QUERY = "(max-width: 1023px), (pointer: coarse)";

export function subscribeToCompactViewport(onChange: () => void): () => void {
  const media = window.matchMedia(COMPACT_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function readCompactViewport(): boolean {
  return window.matchMedia(COMPACT_QUERY).matches;
}

export function serverCompactViewport(): boolean {
  return false;
}
