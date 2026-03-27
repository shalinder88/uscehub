import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { US_STATES } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Observerships by State — 37 States & DC",
  description:
    "Find clinical observerships, externships, and research opportunities for IMGs across 37 US states and DC. Browse programs by state to find opportunities near you.",
  alternates: {
    canonical: "https://uscehub.com/observerships",
  },
  openGraph: {
    title: "Observerships by State — USCEHub",
    description:
      "Browse IMG clinical experience opportunities in all 50 US states. Find observerships, externships, and research programs near you.",
    url: "https://uscehub.com/observerships",
  },
};

export const dynamic = "force-dynamic";

export default async function ObservershipsByStatePage() {
  // Get counts per state
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { state: true },
  });

  const stateCounts: Record<string, number> = {};
  listings.forEach((l) => {
    stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
  });

  // Sort states: ones with listings first (by count desc), then rest alphabetically
  const statesWithListings = Object.entries(US_STATES)
    .filter(([abbr]) => (stateCounts[abbr] || 0) > 0)
    .sort((a, b) => (stateCounts[b[0]] || 0) - (stateCounts[a[0]] || 0));

  const statesWithout = Object.entries(US_STATES)
    .filter(([abbr]) => !stateCounts[abbr])
    .sort((a, b) => a[1].localeCompare(b[1]));

  const totalStates = statesWithListings.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Observerships by State",
    description:
      "Browse clinical experience opportunities for International Medical Graduates in every US state.",
    url: "https://uscehub.com/observerships",
    numberOfItems: totalStates,
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
          name: "Observerships by State",
          item: "https://uscehub.com/observerships",
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
            <MapPin className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h1 className="text-3xl font-bold sm:text-4xl">
              Observerships by State
            </h1>
            <p className="mt-4 text-base text-slate-400">
              {listings.length} programs across {totalStates} states. Find
              clinical observerships, externships, and research opportunities
              near you.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* States with listings */}
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          States with Programs ({statesWithListings.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {statesWithListings.map(([abbr, name]) => {
            const count = stateCounts[abbr] || 0;
            const slug = name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={abbr}
                href={`/observerships/${slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300">
                    {abbr}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                      {name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {count} {count === 1 ? "program" : "programs"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            );
          })}
        </div>

        {/* States without listings */}
        {statesWithout.length > 0 && (
          <>
            <h2 className="mb-4 mt-12 text-lg font-bold text-slate-900 dark:text-white">
              Other States ({statesWithout.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {statesWithout.map(([abbr, name]) => {
                const slug = name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={abbr}
                    href={`/observerships/${slug}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
