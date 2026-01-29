"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** Use the hero gradient background */
  heroGradient?: boolean;
  /** Use dots pattern background */
  dotsPattern?: boolean;
  /** Maximum width variant */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  /** Padding variant */
  padding?: "none" | "sm" | "md" | "lg";
}

const maxWidthMap = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
};

const paddingMap = {
  none: "",
  sm: "px-4 py-8",
  md: "px-6 py-12",
  lg: "px-8 py-16",
};

export function BaseLayout({
  children,
  className,
  heroGradient = false,
  dotsPattern = false,
  maxWidth = "xl",
  padding = "md",
}: BaseLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen",
        "bg-[var(--nimmit-bg-primary)]",
        heroGradient && "bg-gradient-hero",
        dotsPattern && "bg-pattern-dots",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full",
          maxWidthMap[maxWidth],
          paddingMap[padding]
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-display-md text-[var(--nimmit-text-primary)]">
          {title}
        </h1>
        {description && (
          <p className="text-body-lg text-[var(--nimmit-text-secondary)]">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  /** Section title (optional) */
  title?: string;
  /** Section description (optional) */
  description?: string;
}

export function Section({
  children,
  className,
  title,
  description,
}: SectionProps) {
  return (
    <section className={cn("section-padding", className)}>
      {(title || description) && (
        <div className="mb-10 text-center">
          {title && (
            <h2 className="text-display-lg text-[var(--nimmit-text-primary)] mb-3">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-body-lg max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Container({
  children,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component className={cn("container-nimmit", className)}>
      {children}
    </Component>
  );
}
