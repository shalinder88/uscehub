export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingCard } from "@/components/listings/listing-card";
import { Suspense } from "react";
import type { Metadata } from "next";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import { FloatingFinder } from "@/components/tools/floating-finder";

export const metadata: Metadata = {
  title: "Browse Observership, Externship & Research Opportunities",
  description:
    "Search and filter clinical observerships, externships, and research positions for International Medical Graduates across all US states. Free database with verified listings.",
  alternates: {
    canonical: "https://uscehub.com/browse",
  },
};

interface BrowsePageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    state?: string;
    sort?: string;
    free?: string;
    visa?: string;
    verified?: string;
  }>;
}

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

  if (params.type) {
    if (params.type === "RESEARCH") {
      conditions.push({ listingType: { in: ["RESEARCH", "POSTDOC"] } });
    } else {
      conditions.push({ listingType: params.type });
    }
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
      <FloatingFinder />
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {listings.length} {listings.length === 1 ? "listing" : "listings"} found
          </p>
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
