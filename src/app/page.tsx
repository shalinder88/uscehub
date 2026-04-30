export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { FeaturedListings } from "@/components/home/featured-listings";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustSection } from "@/components/home/trust-section";
import { ProgramStats } from "@/components/seo/program-stats";
import { FloatingFinder } from "@/components/tools/floating-finder";
import { ErasCountdown } from "@/components/home/eras-countdown";
import { ActivityFeed } from "@/components/home/activity-feed";
import { MatchCounter } from "@/components/home/match-counter";

export const metadata: Metadata = {
  title: "USCEHub — Verified U.S. Clinical Experience Programs for IMGs",
  description:
    "Search observerships, externships, research roles, and postdoc opportunities with direct source links, visa notes, fee ranges, and verification status. Free and community-reviewed.",
  alternates: {
    canonical: "https://uscehub.com",
  },
};

export default async function HomePage() {
  const [
    totalListings,
    stateData,
    specialtyRaw,
    observerships,
    externships,
    electives,
    research,
    postdoc,
    volunteer,
    allListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "APPROVED" } }),
    prisma.listing.findMany({
      where: { status: "APPROVED", NOT: { state: "MULTI" } },
      select: { state: true },
      distinct: ["state"],
    }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { specialty: true },
    }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "OBSERVERSHIP" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "EXTERNSHIP" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "ELECTIVE" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "RESEARCH" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "POSTDOC" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "VOLUNTEER" } }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { state: true },
    }),
  ]);

  // Merged clinical bucket = observership + externship + elective.
  // These all overlap in practice (same sites use different names); users
  // pick with audience filter, not with type filter.
  const clinicalRotations = observerships + externships + electives;
  const researchPositions = research + postdoc;

  // Normalize specialties: split on commas / em-dash / paren, take primary
  // token, dedupe case-insensitively. Prevents "Dermatology" vs
  // "Dermatology — Surgery" vs "Dermatology (Mohs/Cosmetic)" triple-counting.
  const specialtyBucket = new Set<string>();
  for (const row of specialtyRaw) {
    if (!row.specialty) continue;
    const primary = row.specialty
      .split(/[,—–(]/)[0]
      .trim()
      .toLowerCase();
    if (primary && primary.length > 2) specialtyBucket.add(primary);
  }
  const specialtyCount = specialtyBucket.size;

  // Calculate state counts
  const stateCounts: Record<string, number> = {};
  allListings.forEach((l) => {
    if (l.state && l.state !== "MULTI") {
      stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
    }
  });

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "USCEHub",
    url: "https://uscehub.com",
    logo: "https://uscehub.com/og-default.png",
    description:
      "The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates in the United States.",
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "USCEHub",
    url: "https://uscehub.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://uscehub.com/browse?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Clinical Opportunities for IMGs and Medical Students",
    description:
      "Browse clinical rotations, research positions, and volunteer programs across the United States.",
    numberOfItems: totalListings,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: `${clinicalRotations} Clinical Rotations (observerships, externships, electives)`,
        url: "https://uscehub.com/browse?category=clinical",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${researchPositions} Research Positions`,
        url: "https://uscehub.com/browse?category=research",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${volunteer} Volunteer / Pre-Med Programs`,
        url: "https://uscehub.com/browse?category=volunteer",
      },
    ],
  };

  return (
    <>
      <FloatingFinder />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Hero
        listingCount={totalListings}
        stateCount={stateData.length}
        specialtyCount={specialtyCount}
        typeCounts={{
          clinicalRotations,
          researchPositions,
          volunteer,
        }}
        stateCounts={stateCounts}
      />
      <ErasCountdown />
      <ActivityFeed />
      <FeaturedListings />
      <TrustSection />
      <HowItWorks />
      <ProgramStats />
      <MatchCounter />
    </>
  );
}
