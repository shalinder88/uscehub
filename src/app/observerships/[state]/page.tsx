import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { US_STATES, LISTING_TYPE_LABELS } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Build a reverse map: slug → abbreviation
const SLUG_TO_ABBR: Record<string, string> = {};
for (const [abbr, name] of Object.entries(US_STATES)) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  SLUG_TO_ABBR[slug] = abbr;
}

export const dynamic = "force-dynamic";

function getStateInfo(slug: string) {
  const abbr = SLUG_TO_ABBR[slug];
  if (!abbr) return null;
  return { abbr, name: US_STATES[abbr] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const info = getStateInfo(slug);
  if (!info) return { title: "Not Found" };

  const title = `Observerships & Externships in ${info.name} for IMGs`;
  const description = `Browse clinical observership, externship, and research opportunities in ${info.name} for International Medical Graduates. Find verified programs with reviews, costs, and application details.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://uscehub.com/observerships/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://uscehub.com/observerships/${slug}`,
    },
  };
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const info = getStateInfo(slug);
  if (!info) notFound();

  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      state: info.abbr,
    },
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by type for stats
  const typeCounts: Record<string, number> = {};
  const specialtyCounts: Record<string, number> = {};
  listings.forEach((l) => {
    typeCounts[l.listingType] = (typeCounts[l.listingType] || 0) + 1;
    specialtyCounts[l.specialty] = (specialtyCounts[l.specialty] || 0) + 1;
  });

  const topSpecialties = Object.entries(specialtyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const freeCount = listings.filter(
    (l) =>
      l.cost.toLowerCase().includes("free") ||
      l.cost.toLowerCase().includes("no fee") ||
      l.cost === "$0"
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Observerships & Externships in ${info.name}`,
    description: `Clinical experience opportunities for International Medical Graduates in ${info.name}.`,
    url: `https://uscehub.com/observerships/${slug}`,
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
          name: info.name,
          item: `https://uscehub.com/observerships/${slug}`,
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
              <MapPin className="h-4 w-4" />
              {info.name}
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Observerships &amp; Externships in {info.name}
            </h1>
            <p className="mt-4 text-base text-slate-400">
              {listings.length} clinical experience{" "}
              {listings.length === 1 ? "opportunity" : "opportunities"} for
              International Medical Graduates in {info.name}.
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
                {Object.keys(specialtyCounts).length}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Specialties
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

        {/* Filter badges */}
        {listings.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeCounts).map(([type, count]) => (
                <Badge key={type} variant="default" className="text-xs">
                  {LISTING_TYPE_LABELS[type] || type} ({count})
                </Badge>
              ))}
            </div>
            {topSpecialties.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {topSpecialties.map(([specialty, count]) => (
                  <Badge
                    key={specialty}
                    variant="default"
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {specialty} ({count})
                  </Badge>
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
            <MapPin className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No programs listed in {info.name} yet
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Know a program in {info.name}?{" "}
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

        {/* Cross-links to other states */}
        <div className="mt-14 border-t border-slate-200 dark:border-slate-700 pt-10">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
            Browse Other States
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(US_STATES)
              .filter(([abbr]) => abbr !== info.abbr)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([, name]) => (
                <Link
                  key={name}
                  href={`/observerships/${name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {name}
                </Link>
              ))}
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
          <Link href="/recommend">
            <Button variant="outline" size="lg">
              Use Program Finder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
