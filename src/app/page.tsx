import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/home/hero";
import { FeaturedListings } from "@/components/home/featured-listings";
import { HowItWorks } from "@/components/home/how-it-works";
import { TrustSection } from "@/components/home/trust-section";

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

  return (
    <>
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
      <TrustSection />
      <FeaturedListings />
      <HowItWorks />
    </>
  );
}
