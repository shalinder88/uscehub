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
    ...(avgRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: listing.reviews.length,
          },
        }
      : {}),
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-slate-200 dark:border-slate-700 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {listing.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {listing.city}, {US_STATES[listing.state] || listing.state}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.views + 1} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
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

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Specialty
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {listing.specialty}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Duration
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {listing.duration}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Format
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                  {listing.format.replace("_", " ")}
                </p>
              </div>
              {listing.numberOfSpots && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Spots Available
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {listing.numberOfSpots}
                  </p>
                </div>
              )}
              {listing.startDate && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Start Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {listing.startDate}
                  </p>
                </div>
              )}
              {listing.applicationDeadline && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Deadline
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {listing.applicationDeadline}
                  </p>
                </div>
              )}
            </div>

            {(listing.stepRequirements || listing.ecfmgRequired || listing.graduationYearPref || listing.eligibilitySummary) && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Eligibility Requirements
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {listing.eligibilitySummary && (
                    <p>{listing.eligibilitySummary}</p>
                  )}
                  {listing.stepRequirements && (
                    <p>
                      <span className="font-medium text-slate-700">USMLE: </span>
                      {listing.stepRequirements}
                    </p>
                  )}
                  {listing.ecfmgRequired && (
                    <p>
                      <span className="font-medium text-slate-700">ECFMG: </span>
                      {listing.ecfmgRequired}
                    </p>
                  )}
                  {listing.graduationYearPref && (
                    <p>
                      <span className="font-medium text-slate-700">Graduation Year: </span>
                      {listing.graduationYearPref}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Description
              </h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {listing.fullDescription || listing.shortDescription}
              </div>
            </div>

            {listing.housingSupport && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Housing Support
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {listing.housingSupport}
                </p>
              </div>
            )}

            <Separator className="my-8" />

            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Reviews
                {listing.reviews.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-slate-400">
                    ({listing.reviews.length})
                  </span>
                )}
              </h2>

              {avgRating !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {avgRating.toFixed(1)} out of 5
                  </span>
                </div>
              )}

              {listing.reviews.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {listing.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 dark:border-slate-700 p-4"
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
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {review.anonymous
                                ? "Anonymous"
                                : review.user.name}
                            </p>
                            <p className="text-xs text-slate-400">
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
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                          {review.comment}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          Real experience:{" "}
                          <span className="font-medium">
                            {review.wasReal ? "Yes" : "No"}
                          </span>
                        </span>
                        <span>
                          Worth cost:{" "}
                          <span className="font-medium">
                            {review.worthCost ? "Yes" : "No"}
                          </span>
                        </span>
                        <span>
                          Would recommend:{" "}
                          <span className="font-medium">
                            {review.wouldRecommend ? "Yes" : "No"}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}

              <div className="mt-6">
                <ReviewForm listingId={listing.id} />
              </div>
            </div>

            <Separator className="my-8" />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Something wrong with this listing?
              </p>
              <FlagButton listingId={listing.id} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 p-5">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Cost
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
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
                    listingType: listing.listingType,
                  });
                  const decision = display.cta;
                  const caption = display.ctaCaption;
                  const captionClass =
                    decision.variant === "verified"
                      ? "mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400"
                      : decision.variant === "official-source"
                      ? "mt-2 text-center text-xs text-amber-700 dark:text-amber-400"
                      : "mt-2 text-center text-xs text-slate-500 dark:text-slate-400";

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
                  })}
                  lastVerifiedAt={listing.lastVerifiedAt}
                />

                {listing.contactEmail && (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Contact: {listing.contactEmail}
                  </p>
                )}
              </div>

              {/* Organization section - only show for real posters, not system account */}
              {listing.organization && listing.organization.name !== "USCEHub Directory" && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                      <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {listing.organization.name}
                      </p>
                      {listing.organization.type && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {listing.organization.type}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {listing.organization.city},{" "}
                      {US_STATES[listing.organization.state] ||
                        listing.organization.state}
                    </p>
                    {listing.organization.website && (
                      <a
                        href={listing.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-slate-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 p-5">
                <ShareButtons title={listing.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
