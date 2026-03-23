import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SPECIALTIES, US_STATES, LISTING_TYPE_LABELS } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Build slug → specialty map
const SLUG_TO_SPECIALTY: Record<string, string> = {};
SPECIALTIES.forEach((s) => {
  const slug = s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  SLUG_TO_SPECIALTY[slug] = s;
});

export const dynamic = "force-dynamic";

function getSpecialtyFromSlug(slug: string) {
  return SLUG_TO_SPECIALTY[slug] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string }>;
}): Promise<Metadata> {
  const { specialty: slug } = await params;
  const specialty = getSpecialtyFromSlug(slug);
  if (!specialty) return { title: "Not Found" };

  const title = `${specialty} Observerships & Externships for IMGs`;
  const description = `Browse ${specialty} observership, externship, and research opportunities for International Medical Graduates across the United States. Find verified programs with reviews, costs, and application details.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://uscehub.com/observerships/specialty/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://uscehub.com/observerships/specialty/${slug}`,
    },
  };
}

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ specialty: string }>;
}) {
  const { specialty: slug } = await params;
  const specialty = getSpecialtyFromSlug(slug);
  if (!specialty) notFound();

  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      specialty,
    },
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by state for stats
  const stateCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  listings.forEach((l) => {
    stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
    typeCounts[l.listingType] = (typeCounts[l.listingType] || 0) + 1;
  });

  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const freeCount = listings.filter(
    (l) =>
      l.cost.toLowerCase().includes("free") ||
      l.cost.toLowerCase().includes("no fee") ||
      l.cost === "$0"
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${specialty} Observerships & Externships for IMGs`,
    description: `${specialty} clinical experience opportunities for International Medical Graduates in the United States.`,
    url: `https://uscehub.com/observerships/specialty/${slug}`,
    numberOfItems: listings.length,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listings.length,
      itemListElement: listings.slice(0, 10).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://uscehub.com/listing/${l.id}`,
        name: l.title,
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://uscehub.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Browse Opportunities",
          item: "https://uscehub.com/browse",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: specialty,
          item: `https://uscehub.com/observerships/specialty/${slug}`,
        },
      ],
    },
  };

  return (
    <div className="bg-white dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 text-sm text-slate-300">
              <Stethoscope className="h-4 w-4" />
              {specialty}
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              {specialty} Observerships &amp; Externships
            </h1>
            <p className="mt-4 text-base text-slate-400">
              {listings.length} {specialty.toLowerCase()}{" "}
              {listings.length === 1 ? "opportunity" : "opportunities"} for
              International Medical Graduates across the United States.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        {listings.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {listings.length}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Total Programs
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {freeCount}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Free Programs
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Object.keys(stateCounts).length}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                States
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Object.keys(typeCounts).length}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Program Types
              </p>
            </div>
          </div>
        )}

        {/* Type and state badges */}
        {listings.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <Badge key={type} variant="default" className="text-xs">
                  {LISTING_TYPE_LABELS[type] || type} ({count})
                </Badge>
              ))}
            </div>
            {topStates.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topStates.map(([abbr, count]) => (
                  <Link
                    key={abbr}
                    href={`/observerships/${(US_STATES[abbr] || abbr).toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Badge
                      variant="default"
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    >
                      {US_STATES[abbr] || abbr} ({count})
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-20 text-center">
            <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No {specialty} programs listed yet
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Know a {specialty.toLowerCase()} program?{" "}
              <Link
                href="/community/suggest-program"
                className="text-blue-600 hover:text-blue-700"
              >
                Suggest it
              </Link>{" "}
              to help fellow IMGs.
            </p>
          </div>
        )}

        {/* Cross-links to other specialties */}
        <div className="mt-14 border-t border-slate-200 dark:border-slate-700 pt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            Browse Other Specialties
          </h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.filter((s) => s !== specialty).map((s) => {
              const sSlug = s
                .toLowerCase()
                .replace(/&/g, "and")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              return (
                <Link
                  key={s}
                  href={`/observerships/specialty/${sSlug}`}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {s}
                </Link>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/browse">
            <Button size="lg">
              Browse All Opportunities
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/observerships">
            <Button variant="outline" size="lg">
              Browse by State
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
