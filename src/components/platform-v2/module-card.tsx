/**
 * <ModuleCard> — dashboard / home module tile.
 *
 * For Pathway #1 dashboard shell (PR P1-3) and homepage modules.
 *
 * Strict no-fake doctrine:
 *   - No fake counts ("5 listings saved" only when truly 5).
 *   - No fake progress bars / completion percentages.
 *   - No fake "active users", "trending", "popular" metrics.
 *   - Status chip (`status`) is opt-in and the parent supplies it
 *     from real data; the primitive does not invent one.
 *
 * Renders as a `<Link>` when `href` is provided, else a `<div>`.
 */
"use client";

import { forwardRef, type ReactNode, type HTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ModuleCardProps extends HTMLAttributes<HTMLElement> {
  /** Module title, e.g. "Saved listings". */
  title: string;
  /** Optional one-line description. */
  description?: string;
  /** Optional eyebrow shown above the title. */
  eyebrow?: string;
  /**
   * Optional href. If provided, the entire card becomes a link.
   * Use absolute paths only (e.g. "/dashboard/saved").
   */
  href?: string;
  /**
   * Optional status chip text shown in the top-right corner.
   * Parent supplies this from real data — the primitive never
   * invents counts or activity. Examples: "3 saved", "Coming soon",
   * "Preview only".
   */
  status?: string;
  /** Tone for the optional status chip. */
  statusTone?: "neutral" | "info" | "warning" | "success";
  /**
   * Optional richer body (chart, sparkline, list preview). Parent
   * is responsible for ensuring the body is truthful.
   */
  children?: ReactNode;
  /** Optional icon node rendered before the title. */
  icon?: ReactNode;
}

const STATUS_TONE: Record<NonNullable<ModuleCardProps["statusTone"]>, string> = {
  neutral:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  info:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
};

export const ModuleCard = forwardRef<HTMLElement, ModuleCardProps>(
  (
    {
      title,
      description,
      eyebrow,
      href,
      status,
      statusTone = "neutral",
      children,
      icon,
      className,
      ...rest
    },
    ref,
  ) => {
    const baseClasses = cn(
      "group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900",
      href &&
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:hover:border-slate-600 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900",
      className,
    );

    const inner = (
      <>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {eyebrow}
              </p>
            )}
            <div className={cn("flex items-center gap-2", eyebrow && "mt-1")}>
              {icon && (
                <span className="text-slate-500 dark:text-slate-400" aria-hidden="true">
                  {icon}
                </span>
              )}
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white">
                {title}
              </h3>
            </div>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          {status && (
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                STATUS_TONE[statusTone],
              )}
            >
              {status}
            </span>
          )}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </>
    );

    if (href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...(rest as HTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </Link>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={baseClasses}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {inner}
      </div>
    );
  },
);

ModuleCard.displayName = "ModuleCard";
