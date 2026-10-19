"use client";

import { useSyncExternalStore } from "react";
import { Download } from "lucide-react";

import {
  promptPwaInstall,
  readCompactViewport,
  readPwaInstall,
  serverCompactViewport,
  serverPwaInstall,
  subscribeToCompactViewport,
  subscribeToPwaInstall,
} from "@/lib/pwa";

/**
 * The header's install affordance, shown whenever the browser can install the
 * app and it is not already installed:
 *
 * - Laptop/desktop: a noticeable "Install" pill — the only install UI those
 *   screens ever get, since the big prompt is phone/tablet-only.
 * - Phone/tablet: a compact round button that takes over once the big prompt
 *   has been closed; while the sheet is up, the header stays out of the way.
 *
 * After the native dialog has been shown the event is spent, so the button
 * disappears for the rest of the session.
 */
export function PwaInstallButton() {
  const { ready, dismissed, installed } = useSyncExternalStore(
    subscribeToPwaInstall,
    readPwaInstall,
    serverPwaInstall,
  );
  const compact = useSyncExternalStore(
    subscribeToCompactViewport,
    readCompactViewport,
    serverCompactViewport,
  );

  if (!ready || installed) return null;
  if (compact && !dismissed) return null;

  const install = () => {
    void promptPwaInstall();
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={install}
        aria-label="Install Safe Nest app"
        title="Install Safe Nest app"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      >
        <Download className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={install}
      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
    >
      <Download className="h-4 w-4" />
      Install
    </button>
  );
}
