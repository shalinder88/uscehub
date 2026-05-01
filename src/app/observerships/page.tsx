import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { US_STATES } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SITE_METRICS } from "@/lib/site-metrics";
import { siteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Observerships by State — ${SITE_METRICS.statesCovered} States & DC`,
  description: `Find clinical observerships, externships, and research opportunities for IMGs across ${SITE_METRICS.statesCovered} US states and DC. Browse programs by state to find opportunities near you.`,
  alternates: {
    canonical: siteUrl("/observerships"),
  },
  openGraph: {
    title: "Observerships by State — USCEHub",
    description:
      "Browse IMG clinical experience opportunities in all 50 US states. Find observerships, externships, and research programs near you.",
    url: siteUrl("/observerships"),
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

  const SERIF =
    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — editorial header on warm paper */}
      <div className="border-b border-[#dfd5b8] dark:border-[#34373f]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <MapPin className="mx-auto mb-4 h-9 w-9 text-[#1a5454] dark:text-[#0fa595]" />
            <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
              — By region —
            </p>
            <h1
              className="font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[40px]"
              style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
            >
              Observerships <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">by state</em>
            </h1>
            <p
              className="mx-auto mt-3 max-w-xl text-[15px] italic text-[#4a5057] dark:text-[#bfc1c9]"
              style={{ fontFamily: SERIF }}
            >
              {listings.length} programs across {totalStates} states. Find
              clinical observerships, externships, and research opportunities near you.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* States with listings */}
        <p className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
          — States with programs ({statesWithListings.length}) —
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {statesWithListings.map(([abbr, name]) => {
            const count = stateCounts[abbr] || 0;
            const slug = name.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={abbr}
                href={`/observerships/${slug}`}
                className="group flex items-center justify-between rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 dark:border-[#34373f] dark:bg-[#23262e]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfd5b8] bg-[#f0e9d3] font-mono text-sm font-semibold text-[#1a5454] dark:border-[#34373f] dark:bg-[#2a2d36] dark:text-[#0fa595]">
                    {abbr}
                  </div>
                  <div>
                    <p
                      className="font-serif text-sm font-medium text-[#0d1418] group-hover:text-[#1a5454] dark:text-[#f7f5ec] dark:group-hover:text-[#0fa595]"
                      style={{ fontFamily: SERIF }}
                    >
                      {name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#7e8089]">
                      {count} {count === 1 ? "program" : "programs"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#7a7f88] group-hover:text-[#1a5454] dark:text-[#7e8089] dark:group-hover:text-[#0fa595]" />
              </Link>
            );
          })}
        </div>

        {/* States without listings */}
        {statesWithout.length > 0 && (
          <>
            <p className="mb-3 mt-12 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
              — Other states ({statesWithout.length}) —
            </p>
            <div className="flex flex-wrap gap-2">
              {statesWithout.map(([abbr, name]) => {
                const slug = name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Link
                    key={abbr}
                    href={`/observerships/${slug}`}
                    className="rounded-lg border border-[#dfd5b8] px-3 py-1.5 text-xs font-medium text-[#7a7f88] transition-colors hover:border-[#a87b2e] hover:text-[#0d1418] dark:border-[#34373f] dark:text-[#7e8089] dark:hover:border-[#d8a978] dark:hover:text-[#f7f5ec]"
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
              Browse all opportunities
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/recommend">
            <Button variant="outline" size="lg">
              Use program finder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
