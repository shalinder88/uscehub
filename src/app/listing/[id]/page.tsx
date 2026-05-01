export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { TrustBadges } from "@/components/listings/trust-badges";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";
import { ListingTrustMetadata } from "@/components/listings/listing-trust-metadata";
import { ShareButtons } from "@/components/listings/share-buttons";
import { ReviewForm } from "@/components/listings/review-form";
import { FlagButton } from "@/components/listings/flag-button";
import { listingDisplay, listingVerificationStatus } from "@/lib/listing-display";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Award,
  FileText,
  Globe,
  Building2,
  Mail,
  ExternalLink,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import {
  LISTING_TYPE_LABELS,
  US_STATES,
  formatDate,
} from "@/lib/utils";
import type { Metadata } from "next";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, shortDescription: true, city: true, state: true, listingType: true },
  });
  if (!listing) return { title: "Listing Not Found — USCEHub" };
  const description =
    listing.shortDescription ||
    `${listing.title} — ${LISTING_TYPE_LABELS[listing.listingType] || listing.listingType} opportunity in ${listing.city}, ${listing.state}. Browse details, eligibility, and reviews on USCEHub.`;
  return {
    title: listing.title,
    description,
    openGraph: {
      title: `${listing.title} — USCEHub`,
      description,
      url: `https://uscehub.com/listing/${id}`,
      type: "website",
    },
    alternates: {
      canonical: `https://uscehub.com/listing/${id}`,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      organization: true,
      poster: {
        select: { name: true, posterProfile: true },
      },
      reviews: {
        where: { moderationStatus: "APPROVED" },
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Admins can preview pending/rejected/hidden listings from the moderation
  // queue. Everyone else can only see APPROVED listings.
  const session = await auth();
  const isAdmin = session?.user && (session.user as { role?: string }).role === "ADMIN";
  if (!listing || (listing.status !== "APPROVED" && !isAdmin)) {
    notFound();
  }

  // Don't inflate view counts for admin previews.
  if (listing.status === "APPROVED") {
    await prisma.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  const avgRating =
    listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
        listing.reviews.length
      : null;

  const typeVariant = listing.listingType.toLowerCase() as
    | "observership"
    | "externship"
    | "research"
    | "postdoc"
    | "elective"
    | "volunteer";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: listing.title,
    description: listing.fullDescription || listing.shortDescription,
    provider: listing.organization
      ? {
          "@type": "MedicalOrganization",
          name: listing.organization.name,
          address: {
            "@type": "PostalAddress",
            addressLocality: listing.organization.city,
            addressRegion: listing.organization.state,
            addressCountry: "US",
          },
          ...(listing.organization.website
            ? { url: listing.organization.website }
            : {}),
        }
      : undefined,
    occupationalCategory: listing.specialty,
    timeToComplete: listing.duration,
    offers: {
      "@type": "Offer",
      price: listing.cost,
      priceCurrency: "USD",
    },
    url: `https://uscehub.com/listing/${id}`,
    applicationStartDate: listing.startDate || undefined,
    applicationDeadline: listing.applicationDeadline || undefined,
    // AggregateRating intentionally omitted (PR 0d audit C2): without a
    // verified-purchase / completed-application gate on POST /api/reviews
    // and without a minimum-N threshold, AggregateRating in structured
    // data risks Google rich-results spam classification. Re-introduce
    // when both gates are in place. See REVIEW_FLOW_AUDIT.md §14.
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-[#dfd5b8] dark:border-[#34373f]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={typeVariant}>
              {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
            </Badge>
            {listing.certificateOffered && (
              <Badge variant="success">
                <Award className="mr-1 h-3 w-3" />
                Certificate
              </Badge>
            )}
            {listing.visaSupport && (
              <Badge variant="warning">
                <Globe className="mr-1 h-3 w-3" />
                Visa Support
              </Badge>
            )}
          </div>
          <h1
            className="mt-4 font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
            style={{
              fontFamily:
                "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
              letterSpacing: "-0.022em",
            }}
          >
            {listing.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.city}, {US_STATES[listing.state] || listing.state}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {listing.views + 1} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Posted {formatDate(listing.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ListingDisclaimer className="mb-6" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Only show trust badges for real posters, not system-seeded listings */}
            {listing.organization?.name !== "USCEHub Directory" && (
              <TrustBadges
                adminReviewed={listing.status === "APPROVED"}
                verifiedPoster={
                  listing.organization?.verificationStatus === "APPROVED"
                }
                institutionalEmail={
                  listing.organization?.institutionalEmail || false
                }
                npiVerified={!!listing.poster?.posterProfile?.npiNumber}
              />
            )}

            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e] sm:grid-cols-3">
              <div>
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                  Specialty
                </p>
                <p
                  className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  {listing.specialty}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                  Duration
                </p>
                <p
                  className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  {listing.duration}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                  Format
                </p>
                <p
                  className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  {listing.format.replace("_", " ")}
                </p>
              </div>
              {listing.numberOfSpots && (
                <div>
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                    Spots available
                  </p>
                  <p
                    className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                    style={{
                      fontFamily:
                        "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                    }}
                  >
                    {listing.numberOfSpots}
                  </p>
                </div>
              )}
              {listing.startDate && (
                <div>
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                    Start date
                  </p>
                  <p
                    className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                    style={{
                      fontFamily:
                        "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                    }}
                  >
                    {listing.startDate}
                  </p>
                </div>
              )}
              {listing.applicationDeadline && (
                <div>
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                    Deadline
                  </p>
                  <p
                    className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                    style={{
                      fontFamily:
                        "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                    }}
                  >
                    {listing.applicationDeadline}
                  </p>
                </div>
              )}
            </div>

            {(listing.stepRequirements || listing.ecfmgRequired || listing.graduationYearPref || listing.eligibilitySummary) && (
              <div className="mt-8">
                <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                  — Eligibility —
                </p>
                <h2
                  className="font-serif text-xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  Who this program accepts
                </h2>
                <div className="mt-3 space-y-2 text-sm leading-relaxed text-[#4a5057] dark:text-[#bfc1c9]">
                  {listing.eligibilitySummary && (
                    <p>{listing.eligibilitySummary}</p>
                  )}
                  {listing.stepRequirements && (
                    <p>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:text-[#0fa595]">USMLE</span>
                      <span className="ml-2">{listing.stepRequirements}</span>
                    </p>
                  )}
                  {listing.ecfmgRequired && (
                    <p>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:text-[#0fa595]">ECFMG</span>
                      <span className="ml-2">{listing.ecfmgRequired}</span>
                    </p>
                  )}
                  {listing.graduationYearPref && (
                    <p>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:text-[#0fa595]">Graduation year</span>
                      <span className="ml-2">{listing.graduationYearPref}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8">
              <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                — Program description —
              </p>
              <h2
                className="font-serif text-xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{
                  fontFamily:
                    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                }}
              >
                What the program looks like
              </h2>
              <div
                className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[#4a5057] dark:text-[#bfc1c9]"
                style={{
                  fontFamily:
                    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                }}
              >
                {listing.fullDescription || listing.shortDescription}
              </div>
            </div>

            {listing.housingSupport && (
              <div className="mt-8">
                <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                  — Housing —
                </p>
                <h2
                  className="font-serif text-xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  Housing support
                </h2>
                <p className="mt-2 text-sm text-[#4a5057] dark:text-[#bfc1c9]">
                  {listing.housingSupport}
                </p>
              </div>
            )}

            <Separator className="my-8" />

            <div>
              <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                — Community feedback —
              </p>
              <h2
                className="font-serif text-xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{
                  fontFamily:
                    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                }}
              >
                Reviews
                {listing.reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal italic text-[#7a7f88] dark:text-[#7e8089]">
                    ({listing.reviews.length})
                  </span>
                )}
              </h2>
              <p
                className="mt-2 text-xs italic leading-relaxed text-[#7a7f88] dark:text-[#7e8089]"
                style={{
                  fontFamily:
                    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                }}
              >
                Reviews are user-submitted feedback, moderated before
                publishing. They are separate from the verification badges
                shown on this page, which refer to source-link checks, not
                review endorsement.
              </p>

              {avgRating !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(avgRating)
                            ? "fill-[#a87b2e] text-[#a87b2e] dark:fill-[#d8a978] dark:text-[#d8a978]"
                            : "text-[#dfd5b8] dark:text-[#34373f]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#0d1418] dark:text-[#f7f5ec]">
                    {avgRating.toFixed(1)} out of 5
                  </span>
                </div>
              )}

              {listing.reviews.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {listing.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-[#dfd5b8] bg-[#fcf9eb] p-4 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={
                              review.anonymous
                                ? "Anonymous"
                                : review.user.name
                            }
                            size="sm"
                          />
                          <div>
                            <p
                              className="text-sm font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                              style={{
                                fontFamily:
                                  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                              }}
                            >
                              {review.anonymous
                                ? "Anonymous"
                                : review.user.name}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= review.overallRating
                                  ? "fill-[#a87b2e] text-[#a87b2e] dark:fill-[#d8a978] dark:text-[#d8a978]"
                                  : "text-[#dfd5b8] dark:text-[#34373f]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-[#4a5057] dark:text-[#bfc1c9]">
                          {review.comment}
                        </p>
                      )}
                      {/*
                       * PR 0d audit H2: the live review form does not collect
                       * `wasReal` / `worthCost` / `actualExposure`. Those
                       * fields are silently defaulted to true / 3 server-side,
                       * so rendering them as user-affirmed chips was
                       * misleading. Removed until the form re-collects them.
                       * `wouldRecommend` is still collected by the live form
                       * but is summarized in the aggregate stats; we don't
                       * repeat it per-review here to avoid implying a
                       * structured rubric we don't enforce.
                       */}
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className="mt-3 text-sm italic text-[#7a7f88] dark:text-[#7e8089]"
                  style={{
                    fontFamily:
                      "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                  }}
                >
                  No reviews yet. Be the first to share your experience.
                </p>
              )}

              <div className="mt-6">
                <ReviewForm listingId={listing.id} />
              </div>
            </div>

            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
                Something wrong with this listing?
              </p>
              <FlagButton listingId={listing.id} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
                <div className="text-center">
                  <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                    Cost
                  </p>
                  <p
                    className="mt-1 font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                    style={{
                      fontFamily:
                        "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                    }}
                  >
                    {listing.cost}
                  </p>
                </div>

                <Separator className="my-4" />

                {(() => {
                  // CTA + verification status are normalized through
                  // src/lib/listing-display.ts (which composes
                  // src/lib/listing-cta.ts). Conservative defaults: only
                  // "Apply Now" when admin-verified, otherwise
                  // "View Official Source". See audit P1-5.
                  const display = listingDisplay({
                    websiteUrl: listing.websiteUrl,
                    contactEmail: listing.contactEmail,
                    linkVerified: listing.linkVerified,
                    linkVerificationStatus: listing.linkVerificationStatus,
                    lastVerifiedAt: listing.lastVerifiedAt,
                    listingType: listing.listingType,
                  });
                  const decision = display.cta;
                  const caption = display.ctaCaption;
                  const captionClass =
                    decision.variant === "verified"
                      ? "mt-2 text-center text-xs text-[#1a5454] dark:text-[#0fa595]"
                      : decision.variant === "official-source"
                      ? "mt-2 text-center text-xs text-[#a87b2e] dark:text-[#d8a978]"
                      : "mt-2 text-center text-xs text-[#7a7f88] dark:text-[#7e8089]";

                  if (decision.href) {
                    const linkProps = decision.external
                      ? { target: "_blank", rel: "noopener noreferrer" as const }
                      : {};
                    return (
                      <>
                        <a href={decision.href} {...linkProps} className="block">
                          <Button className="w-full" size="lg">
                            {decision.variant === "contact" && (
                              <Mail className="mr-1 h-4 w-4" />
                            )}
                            {decision.label}
                            {decision.external && (
                              <ExternalLink className="ml-1 h-4 w-4" />
                            )}
                          </Button>
                        </a>
                        {caption && <p className={captionClass}>{caption}</p>}
                      </>
                    );
                  }

                  // No href: missing-source or reverifying. Show disabled-style
                  // button so the CTA card layout stays intact but the user
                  // doesn't get a misleading "Apply" affordance.
                  return (
                    <>
                      <Button className="w-full" size="lg" disabled>
                        {decision.label}
                      </Button>
                      {caption && <p className={captionClass}>{caption}</p>}
                    </>
                  );
                })()}

                {/*
                 * Source-link trust metadata — verification badge + report-broken-link affordance.
                 * Complementary to <TrustBadges> above (which describes the POSTER, not the source link).
                 * Phase 3.5 wires this to the real `linkVerificationStatus` enum and `lastVerifiedAt`
                 * timestamp. The component renders a relative-time line ("Last verified 5 days ago")
                 * only when `verificationStatus === "verified"` AND a real timestamp is present —
                 * never fakes or infers a date (RULES.md §4 / PHASE3 plan §4).
                 */}
                <ListingTrustMetadata
                  className="mt-4"
                  listingId={listing.id}
                  sourceUrl={listing.websiteUrl}
                  verificationStatus={listingVerificationStatus({
                    linkVerified: listing.linkVerified,
                    linkVerificationStatus: listing.linkVerificationStatus,
                    lastVerifiedAt: listing.lastVerifiedAt,
                  })}
                  lastVerifiedAt={listing.lastVerifiedAt}
                />

                {listing.contactEmail && (
                  <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
                    Contact: {listing.contactEmail}
                  </p>
                )}
              </div>

              {/* Organization section - only show for real posters, not system account */}
              {listing.organization && listing.organization.name !== "USCEHub Directory" && (
                <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-5 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfd5b8] bg-[#f0e9d3] dark:border-[#34373f] dark:bg-[#2a2d36]">
                      <Building2 className="h-5 w-5 text-[#1a5454] dark:text-[#0fa595]" />
                    </div>
                    <div>
                      <p
                        className="font-serif text-sm font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                        style={{
                          fontFamily:
                            "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                        }}
                      >
                        {listing.organization.name}
                      </p>
                      {listing.organization.type && (
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
                          {listing.organization.type}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-[#4a5057] dark:text-[#bfc1c9]">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                      {listing.organization.city},{" "}
                      {US_STATES[listing.organization.state] ||
                        listing.organization.state}
                    </p>
                    {listing.organization.website && (
                      <a
                        href={listing.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[#1a5454] hover:underline dark:text-[#0fa595]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-5 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
                <ShareButtons title={listing.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
