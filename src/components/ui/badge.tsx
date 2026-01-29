import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-full",
    "px-3 py-1",
    "text-xs font-medium",
    "w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none",
    "transition-colors duration-200",
    "outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-[var(--nimmit-ring-color)]",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary - terracotta
        default: [
          "bg-[var(--nimmit-accent-primary)]",
          "text-white",
          "[a&]:hover:bg-[var(--nimmit-accent-primary-hover)]",
        ].join(" "),

        // Secondary - slate
        secondary: [
          "bg-[var(--nimmit-accent-secondary)]",
          "text-white",
          "[a&]:hover:bg-[var(--nimmit-accent-secondary-hover)]",
        ].join(" "),

        // Success - sage green
        success: [
          "bg-[var(--nimmit-success-bg)]",
          "text-[var(--nimmit-success)]",
          "border border-[var(--nimmit-success)]/20",
        ].join(" "),

        // Warning - warm yellow
        warning: [
          "bg-[var(--nimmit-warning-bg)]",
          "text-[#9A7B2A]",
          "border border-[var(--nimmit-warning)]/30",
        ].join(" "),

        // Error/Destructive
        destructive: [
          "bg-[var(--nimmit-error-bg)]",
          "text-[var(--nimmit-error)]",
          "border border-[var(--nimmit-error)]/20",
        ].join(" "),

        // Info - soft blue
        info: [
          "bg-[var(--nimmit-info-bg)]",
          "text-[var(--nimmit-info)]",
          "border border-[var(--nimmit-info)]/20",
        ].join(" "),

        // Outline
        outline: [
          "border-2 border-[var(--nimmit-border)]",
          "text-[var(--nimmit-text-primary)]",
          "bg-transparent",
          "[a&]:hover:bg-[var(--nimmit-bg-secondary)]",
        ].join(" "),

        // Ghost
        ghost: [
          "bg-[var(--nimmit-bg-tertiary)]",
          "text-[var(--nimmit-text-secondary)]",
          "[a&]:hover:bg-[var(--nimmit-bg-secondary)]",
          "[a&]:hover:text-[var(--nimmit-text-primary)]",
        ].join(" "),

        // Soft primary
        soft: [
          "bg-[var(--nimmit-accent-primary-light)]",
          "text-[var(--nimmit-accent-primary)]",
        ].join(" "),
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
