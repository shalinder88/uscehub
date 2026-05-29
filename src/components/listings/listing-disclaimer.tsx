import { Info } from "lucide-react";

/**
 * Listing-surface disclaimer banner.
 *
 * Approved mount points (Phase 1 trust rollout, controlled-live mode per
 * docs/codebase-audit/SEO_PRESERVATION_RULES.md):
 *   - /listing/[id]                          (PR1)
 *   - /browse                                (Phase 1)
 *   - /observerships/[state]                 (Phase 1)
 *   - /observerships/specialty/[specialty]   (Phase 1)
 *
 * Do NOT mount on:
 *   - homepage (already has many trust signals; would clutter)
 *   - blog
 *   - /career and any /career/* route (protected unfinished asset)
 *   - global layouts
 *
 * Tone: informational, not alarming. A standard verify-before-applying
 * disclaimer that must not suggest links are broken or unverified. Render
 * only when at least one listing is shown — not on empty-state pages.
 */
export function ListingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 ${className}`.trim()}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <p>
        Always confirm details on the official institution page before
        applying. Requirements, fees, and deadlines can change.
      </p>
    </div>
  );
}
