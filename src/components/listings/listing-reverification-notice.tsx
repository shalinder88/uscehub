import { RefreshCw } from "lucide-react";

interface ListingReverificationNoticeProps {
  message?: string;
  className?: string;
}

/**
 * Small inline notice shown when a listing's source URL is being
 * actively re-verified. Used inside listing detail and inside trust
 * metadata blocks when the verification status is "reverifying".
 *
 * Conservative tone — does not imply the listing is broken, only that
 * the application link is mid-recheck.
 */
export function ListingReverificationNotice({
  message = "We're re-checking this application link. Confirm details on the official institution page before applying.",
  className = "",
}: ListingReverificationNoticeProps) {
  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`.trim()}
    >
      <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
