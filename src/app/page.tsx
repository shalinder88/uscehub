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
import { HomepageContent } from "@/components/home/homepage-content";

export const metadata: Metadata = {
  title: "USCEHub — IMG Career Platform: USCE, Residency, and Career Intelligence",
  description:
    "The IMG career operating system — from USCE to residency to attending career. Search verified observerships, fellowship programs, J-1 waiver jobs, and immigration guidance.",
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

  const stateCounts: Record<string, number> = {};
  allListings.forEach((l) => {
    if (l.state) stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
  });

  const usceContent = (
    <>
      <Hero
        listingCount={totalListings}
        stateCount={stateData.length}
        specialtyCount={specialtyData.length}
        typeCounts={{ observerships, externships, research, postdoc }}
        stateCounts={stateCounts}
      />
      <ErasCountdown />
      <ActivityFeed />
    </>
  );

  return (
    <>
      <FloatingFinder />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "IMG Career Platform — USCE, Residency, Career",
            description:
              "Browse verified observerships, fellowship programs, J-1 waiver jobs, and immigration guidance for IMGs.",
            numberOfItems: totalListings,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: `${observerships} Observership Programs`, url: "https://uscehub.com/browse?type=OBSERVERSHIP" },
              { "@type": "ListItem", position: 2, name: `${externships} Externship Programs`, url: "https://uscehub.com/browse?type=EXTERNSHIP" },
              { "@type": "ListItem", position: 3, name: `${research} Research Positions`, url: "https://uscehub.com/browse?type=RESEARCH" },
              { "@type": "ListItem", position: 4, name: "Residency Resources", url: "https://uscehub.com/residency" },
              { "@type": "ListItem", position: 5, name: "Career & Waiver Jobs", url: "https://uscehub.com/career" },
            ],
          }),
        }}
      />
      <HomepageContent usceContent={usceContent} />
      <TrustSection />
      <FeaturedListings />
      <ProgramSpotlight />
      <HowItWorks />
      <ProgramStats />
      <MatchCounter />
    </>
  );
}
