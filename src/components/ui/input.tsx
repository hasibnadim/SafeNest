import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8 w-full min-w-0 rounded border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-900 shadow-none outline-none transition-colors duration-150 placeholder:text-slate-500 selection:bg-[#0078d4]/20 selection:text-slate-900 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-400 dark:hover:border-slate-500",
        "file:mr-2 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:border-[#0078d4] focus-visible:ring-2 focus-visible:ring-[#0078d4]/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
