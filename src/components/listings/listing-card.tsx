import Link from "next/link";
import { MapPin, Clock, DollarSign, Star, Award, FileText, Globe } from "lucide-react";
import { CardRoot } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingVerificationBadge } from "@/components/listings/listing-verification-badge";
import { SaveButton } from "@/components/listings/save-button";
import { listingVerificationStatus } from "@/lib/listing-display";
import { LISTING_TYPE_LABELS, truncate } from "@/lib/utils";

type LinkVerificationStatusInput =
  | "VERIFIED"
  | "REVERIFYING"
  | "NEEDS_MANUAL_REVIEW"
  | "SOURCE_DEAD"
  | "PROGRAM_CLOSED"
  | "NO_OFFICIAL_SOURCE"
  | "UNKNOWN";

/**
 * P102 Shape A: SOURCE pill says where the URL came from in the
 * link-truth audit. Coexists with the legacy <ListingVerificationBadge>
 * (different signal: verification recency vs URL provenance) per the
 * Shape A cutover plan.
 */
export type SourceBadge = "DIRECT" | "REORIENTED" | "PROTECTED" | "RESEARCH";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    listingType: string;
    city: string;
    state: string;
    specialty: string;
    duration: string;
    cost: string;
    shortDescription: string;
    certificateOffered: boolean;
    lorPossible: boolean;
    visaSupport: boolean;
    linkVerified?: boolean;
    /**
     * Phase 3.5b: real verification fields. When present they take
     * precedence over the legacy `linkVerified` Boolean. List surfaces
     * (browse, observerships, featured) feed these via Prisma's
     * default-all-scalar-fields findMany result.
     */
    linkVerificationStatus?: LinkVerificationStatusInput | null;
    lastVerifiedAt?: Date | string | null;
    reviews?: { overallRating: number }[];
    /**
     * P102 Shape A enrichment. When undefined, the card renders as
     * before — back-compat for callers that don't yet plumb the
     * truth-layer adapter.
     */
    sourceBadge?: SourceBadge;
    specialtyLimited?: string;
  };
}

const SOURCE_BADGE_CLASS: Record<SourceBadge, string> = {
  DIRECT: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700",
  REORIENTED: "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100 border-sky-300 dark:border-sky-700",
  PROTECTED: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100 border-amber-300 dark:border-amber-700",
  RESEARCH: "bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100 border-violet-300 dark:border-violet-700",
};

const SOURCE_BADGE_TITLE: Record<SourceBadge, string> = {
  DIRECT: "Direct official source",
  REORIENTED: "Reoriented to official source",
  PROTECTED: "Live in browser (bot-protected)",
  RESEARCH: "Research / postdoctoral",
};

function getTypeVariant(type: string) {
  const map: Record<string, "observership" | "externship" | "research" | "postdoc" | "elective" | "volunteer"> = {
    OBSERVERSHIP: "observership",
    EXTERNSHIP: "externship",
    RESEARCH: "research",
    POSTDOC: "postdoc",
    ELECTIVE: "elective",
    VOLUNTEER: "volunteer",
  };
  return map[type] || "default";
}

export function ListingCard({ listing }: ListingCardProps) {
  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
        listing.reviews.length
      : null;

  // Phase 3.5b: cards use the same verification mapping as listing detail.
  // The badge is suppressed for plain "unverified" (UNKNOWN, admin-only
  // SOURCE_DEAD/PROGRAM_CLOSED/NO_OFFICIAL_SOURCE, false legacy Boolean)
  // to keep card surfaces uncluttered — those statuses still surface in
  // the listing detail trust block. Verified, verified-on-file,
  // reverifying, and needs-review all render their badge here.
  const verificationStatus = listingVerificationStatus({
    linkVerified: listing.linkVerified,
    linkVerificationStatus: listing.linkVerificationStatus,
    lastVerifiedAt: listing.lastVerifiedAt,
  });
  const showVerificationBadge = verificationStatus !== "unverified";

  return (
    <Link href={`/listing/${listing.id}`}>
      <CardRoot className="card-lift group h-full transition-all duration-200">
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant={getTypeVariant(listing.listingType)}>
              {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
            </Badge>
            <div className="flex items-center gap-2">
              {avgRating !== null && (
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{avgRating.toFixed(1)}</span>
                  <span className="text-slate-400">
                    ({listing.reviews!.length})
                  </span>
                </div>
              )}
              <SaveButton listingId={listing.id} variant="icon" />
            </div>
          </div>

          <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white">
            {listing.title}
          </h3>

          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {listing.city}, {listing.state}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{listing.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{listing.cost}</span>
            </div>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {truncate(listing.shortDescription, 120)}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default" className="text-xs">
              {listing.specialty}
            </Badge>
            {listing.certificateOffered && (
              <Badge variant="success" className="text-xs">
                <Award className="mr-1 h-3 w-3" />
                Certificate
              </Badge>
            )}
            {listing.visaSupport && (
              <Badge variant="warning" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                Visa
              </Badge>
            )}
            {showVerificationBadge && (
              <ListingVerificationBadge status={verificationStatus} />
            )}
            {listing.sourceBadge && (
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${SOURCE_BADGE_CLASS[listing.sourceBadge]}`}
                title={SOURCE_BADGE_TITLE[listing.sourceBadge]}
              >
                {listing.sourceBadge}
              </span>
            )}
            {listing.specialtyLimited && (
              <span
                className="inline-flex items-center rounded border border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-900/40 text-fuchsia-900 dark:text-fuchsia-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                title={`Specialty-limited: ${listing.specialtyLimited}`}
              >
                Specialty: {listing.specialtyLimited}
              </span>
            )}
          </div>
        </div>
      </CardRoot>
    </Link>
  );
}
