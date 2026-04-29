/**
 * <PathwayCard> — selectable pathway tile.
 *
 * Pure UI primitive. No routing, no localStorage, no auth, no
 * fetch, no analytics. The card emits `onSelect(key)` upward; the
 * parent decides what to do with it (write localStorage, scroll
 * to a section, navigate, etc.).
 *
 * Per the URL-wins doctrine, this card MUST NOT redirect. Selecting
 * a pathway is a soft preference, not a navigation.
 *
 * Accessibility:
 *   - When `onSelect` is provided, renders as a `<button>` with
 *     full keyboard support.
 *   - When `onSelect` is omitted, renders as a non-interactive
 *     `<div>` (display-only).
 *   - `active` is reflected via `aria-pressed`.
 */
"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { PathwayKey } from "@/lib/platform-v2/tokens";

export interface PathwayCardProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Stable machine key for this pathway. */
  pathwayKey: PathwayKey;
  /** User-facing title. Use `PATHWAY_LABELS[pathwayKey]` from tokens. */
  title: string;
  /** Short description. Use `PATHWAY_DESCRIPTIONS[pathwayKey]`. */
  description: string;
  /** Optional eyebrow (e.g. "Pathway 1") rendered above the title. */
  eyebrow?: string;
  /** True when this pathway is the user's current selection. */
  active?: boolean;
  /** True to render disabled (e.g. pathway not yet built). */
  disabled?: boolean;
  /**
   * Called with the pathway key when the user selects this card.
   * If omitted, the card renders as a display-only tile.
   */
  onSelect?: (key: PathwayKey) => void;
}

export const PathwayCard = forwardRef<HTMLElement, PathwayCardProps>(
  (
    {
      pathwayKey,
      title,
      description,
      eyebrow,
      active = false,
      disabled = false,
      onSelect,
      className,
      ...rest
    },
    ref,
  ) => {
    const baseClasses = cn(
      "group block w-full rounded-xl border p-5 text-left transition-all",
      active
        ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-950/30"
        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
      !disabled && !active &&
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:hover:border-slate-600",
      disabled && "cursor-not-allowed opacity-50",
      onSelect && !disabled &&
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-slate-900",
      className,
    );

    const inner = (
      <>
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {eyebrow}
          </p>
        )}
        <h3
          className={cn(
            "text-base font-semibold",
            active
              ? "text-emerald-900 dark:text-emerald-100"
              : "text-slate-900 dark:text-slate-100",
            eyebrow && "mt-1",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-1.5 text-sm leading-relaxed",
            active
              ? "text-emerald-800 dark:text-emerald-200"
              : "text-slate-500 dark:text-slate-400",
          )}
        >
          {description}
        </p>
      </>
    );

    if (onSelect) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          aria-pressed={active}
          disabled={disabled}
          onClick={() => onSelect(pathwayKey)}
          className={baseClasses}
          {...(rest as HTMLAttributes<HTMLButtonElement>)}
        >
          {inner}
        </button>
      );
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        aria-current={active ? "true" : undefined}
        className={baseClasses}
        {...(rest as HTMLAttributes<HTMLDivElement>)}
      >
        {inner}
      </div>
    );
  },
);

PathwayCard.displayName = "PathwayCard";
