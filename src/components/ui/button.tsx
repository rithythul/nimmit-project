import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles with Nimmit design tokens
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "text-sm font-medium",
    "rounded-[var(--nimmit-radius-lg)]",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
    "shrink-0 [&_svg]:shrink-0",
    "outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-[var(--nimmit-ring-color)]",
    "active:scale-[0.98]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--nimmit-accent-primary)] text-white",
          "shadow-[var(--nimmit-shadow-sm)]",
          "hover:bg-[var(--nimmit-accent-primary-hover)]",
          "hover:shadow-[var(--nimmit-shadow-md)]",
        ].join(" "),
        secondary: [
          "bg-[var(--nimmit-accent-secondary)] text-white",
          "shadow-[var(--nimmit-shadow-sm)]",
          "hover:bg-[var(--nimmit-accent-secondary-hover)]",
          "hover:shadow-[var(--nimmit-shadow-md)]",
        ].join(" "),
        success: [
          "bg-[var(--nimmit-accent-tertiary)] text-white",
          "shadow-[var(--nimmit-shadow-sm)]",
          "hover:bg-[var(--nimmit-accent-tertiary-hover)]",
          "hover:shadow-[var(--nimmit-shadow-md)]",
        ].join(" "),
        destructive: [
          "bg-[var(--nimmit-error)] text-white",
          "shadow-[var(--nimmit-shadow-sm)]",
          "hover:bg-[#B5443A]",
          "hover:shadow-[var(--nimmit-shadow-md)]",
        ].join(" "),
        outline: [
          "border-2 border-[var(--nimmit-border)]",
          "bg-transparent",
          "text-[var(--nimmit-text-primary)]",
          "hover:bg-[var(--nimmit-bg-secondary)]",
          "hover:border-[var(--nimmit-border-hover)]",
        ].join(" "),
        ghost: [
          "bg-transparent",
          "text-[var(--nimmit-text-primary)]",
          "hover:bg-[var(--nimmit-bg-secondary)]",
        ].join(" "),
        link: [
          "text-[var(--nimmit-accent-primary)]",
          "underline-offset-4",
          "hover:underline",
          "active:scale-100",
        ].join(" "),
        soft: [
          "bg-[var(--nimmit-accent-primary-light)]",
          "text-[var(--nimmit-accent-primary)]",
          "hover:bg-[#EFC4B8]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2.5",
        xs: "h-7 gap-1 rounded-[var(--nimmit-radius-md)] px-2.5 text-xs",
        sm: "h-9 gap-1.5 rounded-[var(--nimmit-radius-md)] px-4 text-sm",
        lg: "h-12 px-7 text-base rounded-[var(--nimmit-radius-xl)]",
        xl: "h-14 px-8 text-lg rounded-[var(--nimmit-radius-xl)]",
        icon: "size-10",
        "icon-xs": "size-7 rounded-[var(--nimmit-radius-md)]",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
