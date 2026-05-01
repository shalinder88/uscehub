import Link from "next/link";
import { CardRoot } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingVerificationBadge } from "@/components/listings/listing-verification-badge";
import { listingVerificationStatus } from "@/lib/listing-display";
import { LISTING_TYPE_LABELS } from "@/lib/utils";

type LinkVerificationStatusInput =
  | "VERIFIED"
  | "REVERIFYING"
  | "NEEDS_MANUAL_REVIEW"
  | "SOURCE_DEAD"
  | "PROGRAM_CLOSED"
  | "NO_OFFICIAL_SOURCE"
  | "UNKNOWN";

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
    linkVerificationStatus?: LinkVerificationStatusInput | null;
    lastVerifiedAt?: Date | string | null;
    reviews?: { overallRating: number }[];
  };
  /**
   * Show a thin colored top-border accent in the type's hue. Only used on
   * the homepage Featured Opportunities. Browse / listing / compare pages
   * omit this for a clean grid.
   */
  accent?: boolean;
}

function getTypeVariant(type: string) {
  const map: Record<
    string,
    "observership" | "externship" | "research" | "postdoc" | "elective" | "volunteer"
  > = {
    OBSERVERSHIP: "observership",
    EXTERNSHIP: "externship",
    RESEARCH: "research",
    POSTDOC: "postdoc",
    ELECTIVE: "elective",
    VOLUNTEER: "volunteer",
  };
  return map[type] || "default";
}

function getAccentBorderClass(type: string): string {
  const t = (type || "").toUpperCase();
  if (t === "OBSERVERSHIP" || t === "EXTERNSHIP" || t === "ELECTIVE") {
    return "border-t-[3px] border-t-[#1a5454] dark:border-t-[#0fa595]";
  }
  if (t === "RESEARCH" || t === "POSTDOC") {
    return "border-t-[3px] border-t-[#a87b2e] dark:border-t-[#d8a978]";
  }
  if (t === "VOLUNTEER") {
    return "border-t-[3px] border-t-[#9c3a2c] dark:border-t-[#e7958a]";
  }
  return "border-t-[3px] border-t-[#1a5454] dark:border-t-[#0fa595]";
}

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

// P1-2B ListingCard — editorial spec-grid layout. Uses ONLY safe FDD-style
// facts already present on the row: duration, cost, specialty, visa,
// certificate. No reviewed dates, no LOR-claim, no authorship — those live
// on the detail page. Two-column micro-grid below the title carries the
// decision-relevant facts at-a-glance without overexposing.
export function ListingCard({ listing, accent = false }: ListingCardProps) {
  const verificationStatus = listingVerificationStatus({
    linkVerified: listing.linkVerified,
    linkVerificationStatus: listing.linkVerificationStatus,
    lastVerifiedAt: listing.lastVerifiedAt,
  });
  const showVerificationBadge = verificationStatus !== "unverified";
  const accentBorder = accent ? getAccentBorderClass(listing.listingType) : "";

  const specs: { label: string; value: string }[] = [
    { label: "Duration", value: listing.duration || "—" },
    { label: "Cost", value: listing.cost || "—" },
    { label: "Specialty", value: listing.specialty || "—" },
    {
      label: "Visa",
      value: listing.visaSupport ? "Supported" : "Not stated",
    },
  ];

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <CardRoot
        className={`group flex h-full flex-col shadow-plush shadow-plush-hover transition-all duration-200 hover:-translate-y-1 ${accentBorder}`}
      >
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant={getTypeVariant(listing.listingType)}>
              {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
            </Badge>
            {showVerificationBadge && (
              <ListingVerificationBadge status={verificationStatus} />
            )}
          </div>

          <h3
            className="mb-1 font-serif text-base font-semibold leading-tight text-[#0d1418] group-hover:text-[#1a5454] dark:text-[#f7f5ec] dark:group-hover:text-[#0fa595]"
            style={{ fontFamily: SERIF }}
          >
            {listing.title}
          </h3>

          <p
            className="mb-4 text-[13px] italic text-[#4a5057] dark:text-[#bfc1c9]"
            style={{ fontFamily: SERIF }}
          >
            {listing.city}, {listing.state}
          </p>

          {/* Spec grid — 2 cols, mono-cap label stacked above Charter value.
              Mirrors the editorial spec-row pattern from the mockup. */}
          <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#dfd5b8] pt-3 dark:border-[#34373f]">
            {specs.map((s) => (
              <div key={s.label} className="min-w-0">
                <dt className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-[#7a7f88] dark:text-[#7e8089]">
                  {s.label}
                </dt>
                <dd
                  className="mt-0.5 truncate text-[13px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                  title={s.value}
                >
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          {listing.certificateOffered && (
            <p
              className="mt-3 text-[12px] italic text-[#a87b2e] dark:text-[#d8a978]"
              style={{ fontFamily: SERIF }}
            >
              Certificate offered
            </p>
          )}
        </div>
      </CardRoot>
    </Link>
  );
}
