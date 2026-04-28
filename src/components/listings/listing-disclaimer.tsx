import { Info } from "lucide-react";

/**
 * Listing-detail-only disclaimer banner.
 *
 * Shown ONLY on /listing/[id] pages per docs/codebase-audit/RULES.md
 * (controlled-live mode, not shutdown mode). Do not mount on the
 * homepage, blog, browse, or career routes.
 *
 * Tone: informational, not alarming. Implies active stewardship of
 * link/deadline accuracy without suggesting the site is broken.
 */
export function ListingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 ${className}`.trim()}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      <p>
        We are re-verifying application links and deadlines. Always confirm
        details on the official institution page before applying.
      </p>
    </div>
  );
}
