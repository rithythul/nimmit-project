import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "h-11 w-full min-w-0 px-4 py-2.5",
        "text-base md:text-sm",
        "text-[var(--nimmit-text-primary)]",
        "placeholder:text-[var(--nimmit-text-tertiary)]",

        // Background and border
        "bg-[var(--nimmit-bg-secondary)]",
        "border border-transparent",
        "rounded-[var(--nimmit-radius-lg)]",

        // Shadow
        "shadow-[var(--nimmit-shadow-inner)]",

        // Transitions
        "transition-all duration-200",
        "outline-none",

        // Focus state
        "focus-visible:bg-[var(--nimmit-bg-elevated)]",
        "focus-visible:border-[var(--nimmit-accent-primary)]",
        "focus-visible:ring-[3px]",
        "focus-visible:ring-[var(--nimmit-ring-color)]",
        "focus-visible:shadow-none",

        // Error state
        "aria-invalid:border-[var(--nimmit-error)]",
        "aria-invalid:ring-[var(--nimmit-error)]/20",

        // Selection
        "selection:bg-[var(--nimmit-accent-primary-light)]",
        "selection:text-[var(--nimmit-text-primary)]",

        // File input
        "file:inline-flex file:h-8 file:border-0",
        "file:bg-[var(--nimmit-bg-tertiary)]",
        "file:text-[var(--nimmit-text-primary)]",
        "file:text-sm file:font-medium",
        "file:mr-3 file:px-3",
        "file:rounded-[var(--nimmit-radius-md)]",

        // Disabled
        "disabled:pointer-events-none",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",

        className
      )}
      {...props}
    />
  )
}

export { Input }
