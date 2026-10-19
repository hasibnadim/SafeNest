"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Download, House, X } from "lucide-react";

import {
  dismissPwaPrompt,
  promptPwaInstall,
  readCompactViewport,
  readPwaInstall,
  serverCompactViewport,
  serverPwaInstall,
  subscribeToCompactViewport,
  subscribeToPwaInstall,
} from "@/lib/pwa";

/**
 * The big install prompt for phone and tablet visitors. When the browser says
 * an install is possible (`beforeinstallprompt` captured) and the screen is
 * compact, a closable bottom sheet slides up; dismissing it leaves the compact
 * install button in the header, and landing on the site again starts the flow
 * over — nothing is remembered between visits.
 *
 * It never renders on laptop/desktop screens — those only get the header
 * button — and never when the app is already running installed.
 *
 * All state comes from the shared store in `@/lib/pwa`, so the header's
 * install button sees the same one-shot event this sheet fires.
 */
export function PwaInstallPrompt() {
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

  const visible = ready && !dismissed && !installed && compact;

  // Escape closes the sheet while it is up.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissPwaPrompt();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center"
      role="presentation"
    >
      {/* Backdrop as a real button so dismissing it stays keyboard-accessible */}
      <button
        type="button"
        aria-label="Dismiss install prompt"
        onClick={dismissPwaPrompt}
        className="absolute inset-0 cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pwa-install-title"
        className="relative w-full max-w-sm rounded-t-3xl border border-slate-200 bg-white p-5 pb-6 shadow-xl animate-in fade-in-0 slide-in-from-bottom-8 duration-300 dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl sm:zoom-in-95 sm:slide-in-from-bottom-0"
      >
        <button
          type="button"
          onClick={dismissPwaPrompt}
          aria-label="Close install prompt"
          className="absolute right-4 top-4 rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors outline-none hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* App-tile mark, in the brand's gradient */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-gray-800 to-blue-600 shadow-md">
          <House className="h-7 w-7 text-white" />
        </div>

        <h2
          id="pwa-install-title"
          className="mt-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
        >
          Install Safe Nest
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Add Safe Nest to your home screen for one-tap access, a full-screen
          app feel, and your session kept close.
        </p>

        <button
          type="button"
          onClick={() => {
            void promptPwaInstall();
          }}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm transition-colors outline-none hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
        <button
          type="button"
          onClick={dismissPwaPrompt}
          className="mt-2 h-10 w-full rounded-full text-sm font-medium text-slate-600 transition-colors outline-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-600 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
