export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [
      total,
      verifiedCount,
      observerships,
      externships,
      research,
      postdoc,
      allListings,
      freeListings,
    ] = await Promise.all([
      prisma.listing.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({
        where: { status: "APPROVED", linkVerified: true },
      }),
      prisma.listing.count({
        where: { status: "APPROVED", listingType: "OBSERVERSHIP" },
      }),
      prisma.listing.count({
        where: { status: "APPROVED", listingType: "EXTERNSHIP" },
      }),
      prisma.listing.count({
        where: { status: "APPROVED", listingType: "RESEARCH" },
      }),
      prisma.listing.count({
        where: { status: "APPROVED", listingType: "POSTDOC" },
      }),
      prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { state: true, listingType: true },
      }),
      prisma.listing.count({
        where: {
          status: "APPROVED",
          OR: [
            { cost: { contains: "Free" } },
            { cost: { contains: "free" } },
            { cost: { contains: "$0" } },
            { cost: { contains: "No fee" } },
          ],
        },
      }),
    ]);

    // Calculate state breakdown
    const stateCounts: Record<string, number> = {};
    allListings.forEach((l) => {
      if (l.state) stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
    });

    const byState = Object.entries(stateCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([state, count]) => ({ state, count }));

    const response = {
      generatedAt: new Date().toISOString(),
      totalListings: total,
      verifiedListings: verifiedCount,
      freeListings,
      statesCovered: Object.keys(stateCounts).length,
      byType: {
        observerships,
        externships,
        research,
        postdoc,
      },
      averageCostRange: {
        observership: { min: "Free", max: "$2,500" },
        externship: { min: "$500", max: "$5,000" },
        research: { min: "Free (often paid)", max: "Varies" },
      },
      byState,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GET /api/programs/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch program statistics" },
      { status: 500 }
    );
  }
}
