export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return Response.json({ error: "ids parameter is required" }, { status: 400 });
    }

    const ids = idsParam.split(",").slice(0, 3);

    if (ids.length < 2) {
      return Response.json({ error: "At least 2 IDs are required" }, { status: 400 });
    }

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: ids },
        status: "APPROVED",
      },
      select: {
        id: true,
        title: true,
        listingType: true,
        specialty: true,
        city: true,
        state: true,
        duration: true,
        cost: true,
        format: true,
        certificateOffered: true,
        lorPossible: true,
        visaSupport: true,
        linkVerified: true,
        shortDescription: true,
        applicationMethod: true,
        startDate: true,
        applicationDeadline: true,
      },
    });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/compare error:", error);
    return Response.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}
