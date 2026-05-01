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
 * Tone: informational, not alarming. Implies active stewardship of
 * link/deadline accuracy without suggesting the site is broken. Render
 * only when at least one listing is shown — not on empty-state pages.
 */
export function ListingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-lg border border-[#dfd5b8] bg-[#fcf9eb] px-4 py-3 text-sm text-[#4a5057] dark:border-[#34373f] dark:bg-[#23262e] dark:text-[#bfc1c9] ${className}`.trim()}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#1a5454] dark:text-[#0fa595]" aria-hidden="true" />
      <p>
        We are re-verifying application links and deadlines. Always confirm
        details on the official institution page before applying.
      </p>
    </div>
  );
}
