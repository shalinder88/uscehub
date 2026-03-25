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
  const [totalListings, stateData, specialtyData, observerships, externships, research, postdoc, allListings] =
    await Promise.all([
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { state: true },
        distinct: ["state"],
      }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { specialty: true },
        distinct: ["specialty"],
      }),
      prisma.listing.count({ where: { status: "APPROVED", listingType: "OBSERVERSHIP" } }),
      prisma.listing.count({ where: { status: "APPROVED", listingType: "EXTERNSHIP" } }),
      prisma.listing.count({ where: { status: "APPROVED", listingType: "RESEARCH" } }),
      prisma.listing.count({ where: { status: "APPROVED", listingType: "POSTDOC" } }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { state: true },
      }),
    ]);

  // Calculate state counts
  const stateCounts: Record<string, number> = {};
  allListings.forEach((l) => {
    if (l.state) stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
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
    name: "Featured Clinical Opportunities for IMGs",
    description:
      "Browse observerships, externships, and research positions across the United States.",
    numberOfItems: totalListings,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: `${observerships} Observership Programs`,
        url: "https://uscehub.com/browse?type=OBSERVERSHIP",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${externships} Externship Programs`,
        url: "https://uscehub.com/browse?type=EXTERNSHIP",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${research} Research Positions`,
        url: "https://uscehub.com/browse?type=RESEARCH",
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
        specialtyCount={specialtyData.length}
        typeCounts={{
          observerships,
          externships,
          research,
          postdoc,
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
