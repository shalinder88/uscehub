import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listings = await prisma.listing.findMany({
      where: { posterId: session.user.id },
      select: {
        id: true,
        title: true,
        listingType: true,
        status: true,
        views: true,
        city: true,
        state: true,
        createdAt: true,
        _count: {
          select: { applications: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/poster-listings error:", error);
    return Response.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
