/**
 * <EmptyState> — reusable empty-state with conservative copy.
 *
 * Doctrine: empty states must NEVER nudge with fake activity (e.g.
 * "join 1,200 IMGs already saving listings"). They explain what is
 * missing and offer a real next step if one exists. See
 * `EMPTY_STATE_COPY` in @/lib/platform-v2/tokens.ts for the
 * canonical defaults.
 *
 * Pure UI. No router. No analytics.
 */
"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  /** Optional icon shown above the title. */
  icon?: ReactNode;
  /** Optional ReactNode for the primary CTA (typically a `<Link>` or `<Button>`). */
  action?: ReactNode;
  /** Visual density. Default = "default". */
  size?: "compact" | "default";
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, size = "default", className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center rounded-xl border border-dashed text-center",
          "border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-900/40",
          size === "compact" ? "p-6" : "p-10",
          className,
        )}
        {...rest}
      >
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center rounded-full",
              "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
              size === "compact" ? "mb-3 h-9 w-9" : "mb-4 h-12 w-12",
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
        <p
          className={cn(
            "font-semibold text-slate-900 dark:text-slate-100",
            size === "compact" ? "text-sm" : "text-base",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "mt-1.5 max-w-prose text-sm leading-relaxed text-slate-500 dark:text-slate-400",
              size === "compact" && "mt-1",
            )}
          >
            {description}
          </p>
        )}
        {action && <div className={cn(size === "compact" ? "mt-3" : "mt-5")}>{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = "EmptyState";
