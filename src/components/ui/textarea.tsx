import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 shadow-none outline-none transition-colors duration-150 placeholder:text-slate-500 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-950/30 dark:text-slate-100 dark:placeholder:text-slate-400 dark:hover:border-slate-500",
        "focus-visible:border-[#0078d4] focus-visible:ring-2 focus-visible:ring-[#0078d4]/20 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
