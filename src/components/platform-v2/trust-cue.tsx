/**
 * <TrustCue> — conservative source/link verification chip.
 *
 * Trust-language doctrine (PR #41 audit + PR #42 fix):
 *
 *   1. The word "verified" appears ONLY when the status genuinely
 *      is `verified` or `recently-verified`. Other statuses use
 *      softer language ("on file", "needs recheck", "re-checking",
 *      "not on file").
 *
 *   2. Reviews are NOT a trust source. This cue describes the
 *      source link / institutional URL only. Per PR #42's listing-
 *      detail separator copy, the visual layout MUST keep review
 *      content distinct.
 *
 *   3. The "Report issue" affordance is opt-in. Pass an `href` to
 *      enable it (e.g. a mailto: or a /contact-admin link). The
 *      primitive does not hardcode any route.
 *
 * Pure UI. No fetch, no analytics, no router.
 */
"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import {
  TRUST_STATUSES,
  TRUST_LABELS,
  TRUST_HINTS,
  type TrustStatus,
} from "@/lib/platform-v2/tokens";

export interface TrustCueProps extends HTMLAttributes<HTMLDivElement> {
  status: TrustStatus;
  /** Optional override for the chip label. Defaults to `TRUST_LABELS[status]`. */
  sourceLabel?: string;
  /** Optional pre-formatted "last reviewed" line, e.g. "Last reviewed: April 2026". */
  lastReviewed?: string;
  /**
   * Optional "Report issue" / "Report broken link" target. If
   * provided, renders an inline affordance with this href + label.
   * Pass any URL — the primitive does not assume a fixed route.
   */
  reportHref?: string;
  /** Label for the report link. Defaults to "Report issue". */
  reportLabel?: string;
  /** Suppress the under-chip hint copy. Default: show hint. */
  hideHint?: boolean;
}

const STATUS_DOT: Record<TrustStatus, string> = {
  [TRUST_STATUSES.VERIFIED]: "bg-emerald-500",
  [TRUST_STATUSES.RECENTLY_VERIFIED]: "bg-emerald-500",
  [TRUST_STATUSES.ON_FILE]: "bg-amber-500",
  [TRUST_STATUSES.NEEDS_RECHECK]: "bg-amber-500",
  [TRUST_STATUSES.REVERIFYING]: "bg-blue-500",
  [TRUST_STATUSES.UNVERIFIED]: "bg-slate-400",
};

const CHIP_TONE: Record<TrustStatus, string> = {
  [TRUST_STATUSES.VERIFIED]:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
  [TRUST_STATUSES.RECENTLY_VERIFIED]:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200",
  [TRUST_STATUSES.ON_FILE]:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
  [TRUST_STATUSES.NEEDS_RECHECK]:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
  [TRUST_STATUSES.REVERIFYING]:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200",
  [TRUST_STATUSES.UNVERIFIED]:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export const TrustCue = forwardRef<HTMLDivElement, TrustCueProps>(
  (
    {
      status,
      sourceLabel,
      lastReviewed,
      reportHref,
      reportLabel = "Report issue",
      hideHint = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const label = sourceLabel ?? TRUST_LABELS[status];
    const hint = hideHint ? null : TRUST_HINTS[status];

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1.5", className)}
        {...rest}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
              CHIP_TONE[status],
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])}
              aria-hidden="true"
            />
            {label}
          </span>
          {lastReviewed && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lastReviewed}
            </span>
          )}
          {reportHref && (
            <a
              href={reportHref}
              className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
            >
              {reportLabel}
            </a>
          )}
        </div>
        {hint && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
    );
  },
);

TrustCue.displayName = "TrustCue";
