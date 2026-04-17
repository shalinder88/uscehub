export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import { FloatingFinder } from "@/components/tools/floating-finder";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Browse Clinical Rotations, Research & Volunteer Opportunities",
  description:
    "Search and filter clinical rotations (observerships, externships, electives), research fellowships, and volunteer programs for IMGs and medical students across all US states. Free, verified, and audience-tagged.",
  alternates: {
    canonical: "https://uscehub.com/browse",
  },
};

interface BrowsePageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    category?: string;
    audience?: string;
    state?: string;
    sort?: string;
    free?: string;
    visa?: string;
    verified?: string;
  }>;
}

// Map the 3 merged categories (used in hero + filters) to the underlying
// enum values. Clinical = observership + externship + elective, all of which
// overlap in practice. Users pick by audience, not by type.
const CATEGORY_TYPES: Record<string, string[]> = {
  clinical: ["OBSERVERSHIP", "EXTERNSHIP", "ELECTIVE"],
  research: ["RESEARCH", "POSTDOC"],
  volunteer: ["VOLUNTEER"],
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [{ status: "APPROVED" }];

  if (params.search) {
    conditions.push({
      OR: [
        { title: { contains: params.search } },
        { shortDescription: { contains: params.search } },
        { specialty: { contains: params.search } },
        { city: { contains: params.search } },
        { state: { contains: params.search } },
      ],
    });
  }

  if (params.category && CATEGORY_TYPES[params.category]) {
    conditions.push({ listingType: { in: CATEGORY_TYPES[params.category] } });
  } else if (params.type) {
    // Legacy ?type= param still supported for bookmarks / back-compat.
    if (params.type === "RESEARCH") {
      conditions.push({ listingType: { in: ["RESEARCH", "POSTDOC"] } });
    } else {
      conditions.push({ listingType: params.type });
    }
  }

  if (params.audience) {
    conditions.push({ audienceTag: params.audience });
  }

  if (params.state) {
    conditions.push({ state: params.state });
  }

  if (params.free === "true") {
    conditions.push({
      OR: [
        { cost: { contains: "Free" } },
        { cost: { contains: "free" } },
        { cost: { contains: "$0" } },
        { cost: { contains: "No fee" } },
      ],
    });
  }

  if (params.visa === "true") {
    conditions.push({ visaSupport: true });
  }

  if (params.verified === "true") {
    conditions.push({ linkVerified: true });
  }

  // Default sort: verified first, then by date
  let orderBy: Record<string, string>[] = [{ linkVerified: "desc" }, { createdAt: "desc" }];
  if (params.sort === "cost-low") orderBy = [{ linkVerified: "desc" }, { cost: "asc" }];
  else if (params.sort === "cost-high") orderBy = [{ linkVerified: "desc" }, { cost: "desc" }];
  else if (params.sort === "most-reviewed") orderBy = [{ linkVerified: "desc" }, { views: "desc" }];

  const listings = await prisma.listing.findMany({
    where: { AND: conditions },
    orderBy,
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
  });

  return (
    <div className="bg-white dark:bg-slate-950">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Browse Opportunities", url: "https://uscehub.com/browse" },
        ]}
      />
      <FloatingFinder />
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} found
          </p>

          <details className="group mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-900 dark:text-slate-100">
              What&apos;s the difference between an observership, externship, elective, and clerkship?
            </summary>
            <div className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-900 dark:text-slate-50">Clinical rotation</strong> is the umbrella term. In practice the labels below overlap — the same program might call itself an observership at one hospital and an externship at another. Pick by your stage, not by the label.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Observership</strong> — Shadow-only. No hands on patients. Most common path for IMG graduates preparing for the US Match.</li>
                <li><strong>Externship</strong> — Often used interchangeably with observership, but sometimes means hands-on activity (taking histories, presenting) under supervision. Rules vary per program.</li>
                <li><strong>Elective / Clerkship</strong> — Formal for-credit clinical rotation, almost always 4 weeks, usually through AAMC <em>VSLO</em>. For current 4th-year US medical students (some accept international M4s via affiliation agreement).</li>
                <li><strong>Research fellowship / postdoc</strong> — Research focus with optional clinical shadowing.</li>
                <li><strong>Volunteer / pre-med</strong> — Structured shadow programs for undergraduates.</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Use the <strong>Audience</strong> filter to narrow to programs that actually accept you (USMLE-IMG graduate, Med Student, Pre-Med/Volunteer, or Specialty Visiting).
              </p>
            </div>
          </details>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />}>
          <ListingFilters />
        </Suspense>

        <div className="mt-6">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-20 text-center">
              <div className="mx-auto max-w-sm">
                <p className="text-lg font-medium text-slate-900 dark:text-white">No listings found</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Try adjusting your filters or search criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <PeopleAlsoAsk />
    </div>
  );
}
