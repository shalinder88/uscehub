export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import { TrustBadges } from "@/components/listings/trust-badges";
import { ShareButtons } from "@/components/listings/share-buttons";
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
    select: { title: true, shortDescription: true },
  });
  if (!listing) return { title: "Listing Not Found — USCEHub" };
  return {
    title: `${listing.title} — USCEHub`,
    description: listing.shortDescription,
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

  if (!listing || listing.status !== "APPROVED") {
    notFound();
  }

  await prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

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

  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
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
            {listing.lorPossible && (
              <Badge variant="info">
                <FileText className="mr-1 h-3 w-3" />
                LOR Available
              </Badge>
            )}
            {listing.visaSupport && (
              <Badge variant="warning">
                <Globe className="mr-1 h-3 w-3" />
                Visa Support
              </Badge>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
            {listing.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
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

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Specialty
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {listing.specialty}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Duration
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {listing.duration}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Format
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {listing.format.replace("_", " ")}
                </p>
              </div>
              {listing.numberOfSpots && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Spots Available
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {listing.numberOfSpots}
                  </p>
                </div>
              )}
              {listing.startDate && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Start Date
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {listing.startDate}
                  </p>
                </div>
              )}
              {listing.applicationDeadline && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Deadline
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {listing.applicationDeadline}
                  </p>
                </div>
              )}
            </div>

            {(listing.stepRequirements || listing.ecfmgRequired || listing.graduationYearPref || listing.eligibilitySummary) && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Eligibility Requirements
                </h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
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
              <h2 className="text-lg font-semibold text-slate-900">
                Description
              </h2>
              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {listing.fullDescription || listing.shortDescription}
              </div>
            </div>

            {listing.housingSupport && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Housing Support
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {listing.housingSupport}
                </p>
              </div>
            )}

            <Separator className="my-8" />

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
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
                      className="rounded-lg border border-slate-200 p-4"
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
                            <p className="text-sm font-medium text-slate-900">
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
                        <p className="mt-3 text-sm text-slate-600">
                          {review.comment}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
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
                <p className="mt-3 text-sm text-slate-500">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Cost
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {listing.cost}
                  </p>
                </div>

                <Separator className="my-4" />

                {listing.websiteUrl ? (
                  <>
                    <a
                      href={listing.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full" size="lg">
                        {listing.linkVerified ? "Apply Now" : "Visit Website"}
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </Button>
                    </a>
                    {listing.linkVerified ? (
                      <p className="mt-2 text-center text-xs text-green-600 flex items-center justify-center gap-1">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                        Verified program link
                      </p>
                    ) : (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-amber-600">
                          ⚠ Unverified — this program is listed based on its history of accepting observers. Observership availability may have changed. Contact the institution directly to confirm.
                        </p>
                      </div>
                    )}
                  </>
                ) : listing.contactEmail ? (
                  <a href={`mailto:${listing.contactEmail}`}>
                    <Button className="w-full" size="lg">
                      <Mail className="mr-1 h-4 w-4" />
                      Contact to Apply
                    </Button>
                  </a>
                ) : (
                  <Button className="w-full" size="lg">
                    Apply Through Platform
                  </Button>
                )}

                {listing.contactEmail && (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Contact: {listing.contactEmail}
                  </p>
                )}
              </div>

              {/* Organization section - only show for real posters, not system account */}
              {listing.organization && listing.organization.name !== "USCEHub Directory" && (
                <div className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {listing.organization.name}
                      </p>
                      {listing.organization.type && (
                        <p className="text-xs text-slate-500">
                          {listing.organization.type}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-500">
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

              <div className="rounded-xl border border-slate-200 p-5">
                <ShareButtons title={listing.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
