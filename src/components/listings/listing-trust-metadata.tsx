import {
  ListingVerificationBadge,
  type ListingVerificationStatus,
} from "@/components/listings/listing-verification-badge";
import { ListingReverificationNotice } from "@/components/listings/listing-reverification-notice";
import { ReportBrokenLinkButton } from "@/components/listings/report-broken-link-button";
import { formatRelativeTime } from "@/lib/relative-time";

interface ListingTrustMetadataProps {
  /** Listing primary key — required for the report-broken-link wire. */
  listingId: string;
  /** The source URL whose verification status this metadata describes. */
  sourceUrl?: string | null;
  /** Verification status. Defaults to "unverified" — conservative. */
  verificationStatus?: ListingVerificationStatus;
  /** Free-form date string ("March 2026") — purely display. Legacy prop; prefer `lastVerifiedAt`. */
  lastVerified?: string | null;
  /**
   * Phase 3.5: real verification timestamp from the DB. Rendered as
   * relative time ("5 days ago") only when status === "verified" — never
   * fabricates a verification date for unverified or reverifying rows.
   */
  lastVerifiedAt?: Date | string | null;
  /**
   * Optional URL where users can suggest an update / corrected source.
   * If omitted, the report-broken-link button still appears.
   */
  suggestUpdateUrl?: string | null;
  /** Show the report-broken-link affordance. Defaults true. */
  showReportLink?: boolean;
  /** Compact rendering for cards (badge only, no notice / report row). */
  compact?: boolean;
  className?: string;
}

/**
 * Composes the small trust signals around a listing's source link.
 * Renders only what is meaningful — never inflates trust signal.
 *
 * Three pre-existing trust components (TrustBadges, VerificationBadge,
 * VerifiedBadge) are PRESERVED IN PLACE per docs/codebase-audit/RULES.md.
 * New code should reach for ListingTrustMetadata; existing call sites
 * stay as-is until explicitly migrated in a future PR.
 */
export function ListingTrustMetadata({
  listingId,
  sourceUrl,
  verificationStatus = "unverified",
  lastVerified,
  lastVerifiedAt,
  suggestUpdateUrl,
  showReportLink = true,
  compact = false,
  className = "",
}: ListingTrustMetadataProps) {
  // Only show a relative-time line when the listing is actually verified.
  // Per RULES.md / PHASE3 plan §4 we never render a fake or inferred
  // verification date.
  const realRelative =
    verificationStatus === "verified" ? formatRelativeTime(lastVerifiedAt) : null;
  const displayLine = realRelative ?? lastVerified ?? null;

  if (compact) {
    return (
      <ListingVerificationBadge
        status={verificationStatus}
        lastVerified={displayLine}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-2">
        <ListingVerificationBadge
          status={verificationStatus}
          lastVerified={displayLine}
        />
        {displayLine && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last verified <strong className="font-medium">{displayLine}</strong>
          </span>
        )}
      </div>

      {verificationStatus === "reverifying" && <ListingReverificationNotice />}

      {verificationStatus === "needs-review" && (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Source needs review — verify directly with the institution before applying.
        </p>
      )}

      {showReportLink && (
        <div className="flex flex-wrap items-center gap-3">
          <ReportBrokenLinkButton listingId={listingId} sourceUrl={sourceUrl} />
          {suggestUpdateUrl && (
            <a
              href={suggestUpdateUrl}
              className="text-xs text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:text-slate-400 dark:hover:text-slate-200"
            >
              Suggest an update
            </a>
          )}
        </div>
      )}
    </div>
  );
}
