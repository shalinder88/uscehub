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
import { ProgramSpotlight } from "@/components/home/program-spotlight";
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
    clerkships,
    visitingStudents,
    research,
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
    prisma.listing.count({ where: { status: "APPROVED", listingType: "CLERKSHIP" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "MD_DO_VISITING_STUDENTS" } }),
    prisma.listing.count({ where: { status: "APPROVED", listingType: "RESEARCH" } }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { state: true },
    }),
  ]);

  // G0 cutover 2026-05-27: 4 canonical categories — no more merging
  // observership+externship+elective into a "clinical" bucket. EXTERNSHIP,
  // ELECTIVE, POSTDOC, VOLUNTEER all have 0 APPROVED rows.

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
      "An independent, source-linked directory of U.S. clinical experience opportunities, including observerships, externships, research, volunteer, and related programs.",
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
    name: "U.S. Clinical Experience Programs for IMGs and Medical Students",
    description:
      "Browse observerships, clerkships, MD/DO visiting student rotations, and research positions across the United States.",
    numberOfItems: totalListings,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: `${observerships} Observerships`,
        url: "https://uscehub.com/browse?category=observership",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${clerkships} Clerkships`,
        url: "https://uscehub.com/browse?category=clerkship",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${visitingStudents} MD/DO Visiting Students (VSLO)`,
        url: "https://uscehub.com/browse?category=visiting",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${research} Research Positions`,
        url: "https://uscehub.com/browse?category=research",
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
          observerships,
          clerkships,
          visitingStudents,
          research,
        }}
        stateCounts={stateCounts}
      />
      <ErasCountdown />
      <ActivityFeed />
      <TrustSection />
      <FeaturedListings />
      <ProgramSpotlight />
      <HowItWorks />
      <ProgramStats />
      <MatchCounter />
    </>
  );
}
