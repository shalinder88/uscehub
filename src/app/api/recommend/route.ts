export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const budget = searchParams.get("budget");
    const specialty = searchParams.get("specialty");
    const visa = searchParams.get("visa");
    const region = searchParams.get("region");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [{ status: "APPROVED" }];

    // Budget filter
    if (budget === "free") {
      conditions.push({
        OR: [
          { cost: { contains: "Free" } },
          { cost: { contains: "free" } },
          { cost: { contains: "$0" } },
          { cost: { contains: "No fee" } },
        ],
      });
    }
    // We can't do numeric comparisons on a string cost field easily,
    // so we fetch all and filter client-side for budget ranges.

    // Specialty filter
    if (specialty && specialty !== "any") {
      conditions.push({ specialty: { contains: specialty } });
    }

    // Visa support
    if (visa === "need-support") {
      conditions.push({ visaSupport: true });
    }

    // Region filter (map to states)
    const regionStates: Record<string, string[]> = {
      northeast: [
        "CT", "DE", "MA", "MD", "ME", "NH", "NJ", "NY", "PA", "RI", "VT", "DC",
      ],
      midwest: [
        "IA", "IL", "IN", "KS", "MI", "MN", "MO", "ND", "NE", "OH", "SD", "WI",
      ],
      south: [
        "AL", "AR", "FL", "GA", "KY", "LA", "MS", "NC", "OK", "SC", "TN", "TX",
        "VA", "WV",
      ],
      west: [
        "AK", "AZ", "CA", "CO", "HI", "ID", "MT", "NM", "NV", "OR", "UT", "WA",
        "WY",
      ],
    };

    if (region && region !== "any" && regionStates[region]) {
      conditions.push({ state: { in: regionStates[region] } });
    }

    const listings = await prisma.listing.findMany({
      where: { AND: conditions },
      orderBy: [{ linkVerified: "desc" }, { views: "desc" }],
      take: 20,
      include: {
        reviews: {
          where: { moderationStatus: "APPROVED" },
          select: { overallRating: true },
        },
      },
    });

    // Post-fetch budget filtering for ranges (since cost is a string)
    let filtered = listings;
    if (budget && budget !== "free" && budget !== "any") {
      filtered = listings.filter((l) => {
        const numMatch = l.cost.match(/\$?([\d,]+)/);
        if (!numMatch) return true; // Can't parse, include it
        const amount = parseInt(numMatch[1].replace(/,/g, ""), 10);
        if (isNaN(amount)) return true;

        switch (budget) {
          case "under500":
            return amount < 500;
          case "500to1500":
            return amount >= 500 && amount <= 1500;
          case "1500to3000":
            return amount >= 1500 && amount <= 3000;
          default:
            return true;
        }
      });
    }

    return Response.json({ listings: filtered });
  } catch (error) {
    console.error("GET /api/recommend error:", error);
    return Response.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
