import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { US_STATES, LISTING_TYPE_LABELS } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dfd5b8] bg-[#fcf9eb] px-4 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:border-[#34373f] dark:bg-[#23262e] dark:text-[#0fa595]">
              <MapPin className="h-3.5 w-3.5" />
              {info.name}
            </div>
            <h1
              className="font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[40px]"
              style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
            >
              Observerships &amp; <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">externships</em> in {info.name}
            </h1>
            <p
              className="mt-3 text-[15px] italic text-[#4a5057] dark:text-[#bfc1c9]"
              style={{ fontFamily: SERIF }}
            >
              {listings.length} clinical experience{" "}
              {listings.length === 1 ? "opportunity" : "opportunities"} in {info.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        {listings.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p
                className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{ fontFamily: SERIF }}
              >
                {listings.length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Total programs
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p
                className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{ fontFamily: SERIF }}
              >
                {freeCount}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Free programs
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p
                className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{ fontFamily: SERIF }}
              >
                {Object.keys(specialtyCounts).length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Specialties
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p
                className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                style={{ fontFamily: SERIF }}
              >
                {Object.keys(typeCounts).length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Program types
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
                    className="text-xs bg-[#f0e9d3] text-[#4a5057] dark:bg-[#2a2d36] dark:text-[#bfc1c9]"
                  >
                    {specialty} ({count})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings grid */}
        {listings.length > 0 && <ListingDisclaimer className="mb-5" />}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] py-20 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
            <MapPin className="mx-auto h-10 w-10 text-[#7a7f88] dark:text-[#7e8089]" />
            <h2
              className="mt-4 font-serif text-lg font-medium text-[#0d1418] dark:text-[#f7f5ec]"
              style={{ fontFamily: SERIF }}
            >
              No programs listed in {info.name} yet
            </h2>
            <p
              className="mt-2 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]"
              style={{ fontFamily: SERIF }}
            >
              Know a program in {info.name}?{" "}
              <Link
                href="/community/suggest-program"
                className="not-italic text-[#1a5454] hover:underline dark:text-[#0fa595]"
              >
                Suggest it
              </Link>{" "}
              to help future applicants.
            </p>
          </div>
        )}

        {/* Cross-links to other states */}
        <div className="mt-14 border-t border-[#dfd5b8] pt-10 dark:border-[#34373f]">
          <p className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
            — Browse other states —
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(US_STATES)
              .filter(([abbr]) => abbr !== info.abbr)
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([, name]) => (
                <Link
                  key={name}
                  href={`/observerships/${name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="rounded-lg border border-[#dfd5b8] px-3 py-1.5 text-xs font-medium text-[#7a7f88] transition-colors hover:border-[#a87b2e] hover:bg-[#fcf9eb] hover:text-[#0d1418] dark:border-[#34373f] dark:text-[#7e8089] dark:hover:border-[#d8a978] dark:hover:bg-[#23262e] dark:hover:text-[#f7f5ec]"
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
