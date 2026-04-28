import {
  ListingVerificationBadge,
  type ListingVerificationStatus,
} from "@/components/listings/listing-verification-badge";
import { ListingReverificationNotice } from "@/components/listings/listing-reverification-notice";
import { ReportBrokenLinkButton } from "@/components/listings/report-broken-link-button";

interface ListingTrustMetadataProps {
  /** Listing primary key — required for the report-broken-link wire. */
  listingId: string;
  /** The source URL whose verification status this metadata describes. */
  sourceUrl?: string | null;
  /** Verification status. Defaults to "unverified" — conservative. */
  verificationStatus?: ListingVerificationStatus;
  /** Free-form date string ("March 2026") — purely display. */
  lastVerified?: string | null;
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
  suggestUpdateUrl,
  showReportLink = true,
  compact = false,
  className = "",
}: ListingTrustMetadataProps) {
  if (compact) {
    return (
      <ListingVerificationBadge
        status={verificationStatus}
        lastVerified={lastVerified}
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="flex flex-wrap items-center gap-2">
        <ListingVerificationBadge
          status={verificationStatus}
          lastVerified={lastVerified}
        />
        {lastVerified && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Last verified <strong className="font-medium">{lastVerified}</strong>
          </span>
        )}
      </div>

      {verificationStatus === "reverifying" && <ListingReverificationNotice />}

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
