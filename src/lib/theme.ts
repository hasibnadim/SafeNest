/**
 * Theme state shared by every control that reads or flips it.
 *
 * The resolved theme is a `dark` class on `<html>` plus a `localStorage` hint,
 * so components observe the same value through the `storage` event instead of
 * a context provider — that is how the account menu, and now the footer
 * toggle, stay in step.
 *
 * A real `storage` event only fires in *other* tabs, so `applyTheme` raises a
 * synthetic one after writing. Without it, toggling in the footer would leave
 * the account menu (and the document-effect that mirrors the class) holding a
 * stale reading until the next full render.
 */

export type ColorScheme = "light" | "dark";

/** Stored preference first, then the OS preference. */
export function readColorScheme(): ColorScheme {
  const stored = window.localStorage.getItem("theme");
  if (stored) return stored === "dark" ? "dark" : "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function subscribeToColorScheme(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** The pre-hydration reading; the client resolves the real value after mount. */
export function serverColorScheme(): ColorScheme {
  return "light";
}

/** Persists the choice, mirrors it onto the document, and notifies listeners. */
export function applyTheme(next: ColorScheme): void {
  window.localStorage.setItem("theme", next);
  document.documentElement.classList.toggle("dark", next === "dark");
  window.dispatchEvent(new Event("storage"));
}
