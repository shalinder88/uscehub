export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard, type SourceBadge } from "@/components/listings/listing-card";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import { FloatingFinder } from "@/components/tools/floating-finder";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { findDisplayEligibleByName } from "@/lib/p102-display-eligible-listings";

export const metadata: Metadata = {
  title: "Browse Observerships, Clerkships, MD/DO Visiting & Research",
  description:
    "Search observerships, clerkships, MD/DO visiting student rotations (VSLO), and research positions for IMGs and medical students across all US states. Free, verified, and audience-tagged.",
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
    specialty?: string;
  }>;
}

// G0 cutover 2026-05-27: the 4 canonical categories. EXTERNSHIP /
// ELECTIVE / POSTDOC / VOLUNTEER had 0 APPROVED rows after the G0 walk
// so they're dropped from filter routing. CLERKSHIP and
// MD_DO_VISITING_STUDENTS were added to the enum 2026-05-26 (commit
// 36f765b) but never wired into the filter map until now.
const CATEGORY_TYPES: Record<string, string[]> = {
  observership: ["OBSERVERSHIP"],
  clerkship: ["CLERKSHIP"],
  visiting: ["MD_DO_VISITING_STUDENTS"],
  research: ["RESEARCH"],
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;

  // G0 cutover 2026-05-27: the P102 display-eligibility allowlist
  // (`getActiveDisplayProgramNames`) was frozen pre-walk and only
  // contained 101 names — it hid the 102 rows added/repaired during
  // the G0 walk + final-sweep inserts. status=APPROVED is now the
  // single source of truth for /browse. Hide-list rows are already
  // marked status=HIDDEN in the DB, so this AND-clause was redundant
  // defense-in-depth that turned into stale gatekeeping.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conditions: any[] = [
    { status: "APPROVED" },
  ];

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
    // POSTDOC merging removed — that type has 0 APPROVED rows post-G0.
    conditions.push({ listingType: params.type });
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

  // Default sort: freshly cron/admin-verified rows first (real
  // `lastVerifiedAt` timestamp present, newest first), then legacy
  // verified-on-file rows (linkVerified=true with null lastVerifiedAt),
  // then everything else. Matches the badge precedence shipped in
  // PR #13/#16 so the most trustworthy rows lead the grid.
  const FRESH_FIRST: Prisma.ListingOrderByWithRelationInput = {
    lastVerifiedAt: { sort: "desc", nulls: "last" },
  };
  let orderBy: Prisma.ListingOrderByWithRelationInput[] = [
    FRESH_FIRST,
    { linkVerified: "desc" },
    { createdAt: "desc" },
  ];
  if (params.sort === "cost-low")
    orderBy = [FRESH_FIRST, { linkVerified: "desc" }, { cost: "asc" }];
  else if (params.sort === "cost-high")
    orderBy = [FRESH_FIRST, { linkVerified: "desc" }, { cost: "desc" }];
  else if (params.sort === "most-reviewed")
    orderBy = [FRESH_FIRST, { linkVerified: "desc" }, { views: "desc" }];

  const rawListings = await prisma.listing.findMany({
    where: { AND: conditions },
    orderBy,
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
  });

  // ── P102 Shape A: enrich each Prisma row with the truth-layer's
  //    sourceBadge + specialtyLimited so <ListingCard> can render
  //    the SOURCE pill and the SPECIALTY pill. Lookup is O(1) on
  //    the adapter's cached index.
  const enrichedListings = rawListings.map((listing) => {
    const lookup = findDisplayEligibleByName(listing.title);
    const sourceBadge: SourceBadge | undefined =
      lookup?.row.badge === "DIRECT" ||
      lookup?.row.badge === "REORIENTED" ||
      lookup?.row.badge === "PROTECTED" ||
      lookup?.row.badge === "RESEARCH"
        ? (lookup.row.badge as SourceBadge)
        : undefined;
    return {
      ...listing,
      sourceBadge,
      specialtyLimited: lookup?.row.specialtyLimited,
    };
  });

  // ?specialty=only — show only rows the truth layer flagged as
  // specialty-limited (BronxCare = Psychiatry, Carolinas = IM, etc.).
  const listings =
    params.specialty === "only"
      ? enrichedListings.filter((l) => !!l.specialtyLimited)
      : enrichedListings;

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
              What&apos;s the difference between an observership, clerkship, MD/DO visiting, and research?
            </summary>
            <div className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                USCEHub uses four canonical categories. Pick by where you are in training — most applicants belong to exactly one.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Observership</strong> — Shadow-only. No hands on patients. The standard route for IMG graduates preparing for the US Match.</li>
                <li><strong>Clerkship</strong> — Formal hands-on clinical rotation at a US institution, typically with supervision. Smaller pool than observerships; eligibility usually requires final-year status and Step 2 in some specialties.</li>
                <li><strong>MD/DO Visiting Students (VSLO)</strong> — For current 4th-year students at US LCME MD or AOA-COCA DO schools, for-credit electives through the AAMC <em>VSLO</em> platform. Most programs are US-only; a few accept international M4s via reciprocal exchange agreements.</li>
                <li><strong>Research</strong> — Research fellowships and postdoc roles, with optional clinical shadowing.</li>
              </ul>
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Use the <strong>Audience</strong> filter to narrow further (IMG graduate, US M4, INTL M4, etc.).
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
          {listings.length > 0 && <ListingDisclaimer className="mb-5" />}
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
