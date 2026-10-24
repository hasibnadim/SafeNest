import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-3 bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300"
    >
      <Loader2
        aria-hidden="true"
        className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400"
      />
      <p className="text-sm font-medium">Opening property details…</p>
    </main>
  );
}
