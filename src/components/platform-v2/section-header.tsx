/**
 * <SectionHeader> — reusable section heading.
 *
 * Three slots:
 *   - eyebrow (optional, small uppercase line above the title)
 *   - title (required, semibold heading)
 *   - description (optional, one-line subtitle)
 *   - action (optional, ReactNode rendered on the right edge — typical
 *     uses: "View all" Link, filter Select, or a CTA Button)
 *
 * Pure UI. No router. No analytics.
 */
"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  /**
   * Heading level for the title element. Defaults to "h2" — change
   * when the component is nested under another h2 to keep the
   * outline accessible.
   */
  as?: "h1" | "h2" | "h3";
}

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, eyebrow, action, as = "h2", className, ...rest }, ref) => {
    const Heading = as as React.ElementType;
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
          className,
        )}
        {...rest}
      >
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {eyebrow}
            </p>
          )}
          <Heading
            className={cn(
              "text-xl font-bold text-slate-900 dark:text-slate-100",
              eyebrow && "mt-1",
            )}
          >
            {title}
          </Heading>
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  },
);

SectionHeader.displayName = "SectionHeader";
