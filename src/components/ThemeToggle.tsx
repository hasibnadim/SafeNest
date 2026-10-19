"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import {
  applyTheme,
  readColorScheme,
  serverColorScheme,
  subscribeToColorScheme,
  type ColorScheme,
} from "@/lib/theme";

/**
 * Footer theme switch: it shows the mode you are currently in and flips to
 * the other one. Reading goes through the shared helpers, so a toggle from
 * the account menu updates this button too (and the other way round).
 */
export function ThemeToggle() {
  const colorScheme = useSyncExternalStore<ColorScheme>(
    subscribeToColorScheme,
    readColorScheme,
    serverColorScheme,
  );
  const isDark = colorScheme === "dark";
  const next: ColorScheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-2.5 py-1 text-slate-600 transition-colors outline-none hover:border-blue-500 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-teal-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-400 dark:hover:text-blue-400"
    >
      {isDark ? (
        <Moon className="h-3.5 w-3.5" />
      ) : (
        <Sun className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
