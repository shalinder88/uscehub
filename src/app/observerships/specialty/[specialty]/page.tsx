import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SPECIALTIES, US_STATES, LISTING_TYPE_LABELS } from "@/lib/utils";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";
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
              <Stethoscope className="h-3.5 w-3.5" />
              {specialty}
            </div>
            <h1
              className="font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[40px]"
              style={{
                fontFamily:
                  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
                letterSpacing: "-0.022em",
              }}
            >
              {specialty} <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">observerships</em> &amp; externships
            </h1>
            <p
              className="mt-3 text-[15px] italic text-[#4a5057] dark:text-[#bfc1c9]"
              style={{
                fontFamily:
                  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif",
              }}
            >
              {listings.length} {specialty.toLowerCase()}{" "}
              {listings.length === 1 ? "opportunity" : "opportunities"} across the United States.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        {listings.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
                {listings.length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Total Programs
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
                {freeCount}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                Free Programs
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
                {Object.keys(stateCounts).length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
                States
              </p>
            </div>
            <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-4 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
              <p className="font-serif text-2xl font-medium text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
                {Object.keys(typeCounts).length}
              </p>
              <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7a7f88] dark:text-[#7e8089]">
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
                      className="text-xs bg-[#f0e9d3] text-[#4a5057] hover:bg-[#dfd5b8] dark:bg-[#2a2d36] dark:text-[#bfc1c9] dark:hover:bg-[#34373f]"
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
        {listings.length > 0 && <ListingDisclaimer className="mb-5" />}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] py-20 text-center shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
            <Stethoscope className="mx-auto h-10 w-10 text-[#7a7f88] dark:text-[#7e8089]" />
            <h2
              className="mt-4 font-serif text-lg font-medium text-[#0d1418] dark:text-[#f7f5ec]"
              style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}
            >
              No {specialty} programs listed yet
            </h2>
            <p
              className="mt-2 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]"
              style={{ fontFamily: "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif" }}
            >
              Know a {specialty.toLowerCase()} program?{" "}
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

        {/* Cross-links to other specialties */}
        <div className="mt-14 border-t border-[#dfd5b8] pt-10 dark:border-[#34373f]">
          <p className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
            — Browse other specialties —
          </p>
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
                  className="rounded-lg border border-[#dfd5b8] px-3 py-1.5 text-xs font-medium text-[#7a7f88] transition-colors hover:border-[#a87b2e] hover:bg-[#fcf9eb] hover:text-[#0d1418] dark:border-[#34373f] dark:text-[#7e8089] dark:hover:border-[#d8a978] dark:hover:bg-[#23262e] dark:hover:text-[#f7f5ec]"
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
