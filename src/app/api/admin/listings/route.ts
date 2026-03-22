export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const listings = await prisma.listing.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        title: true,
        listingType: true,
        specialty: true,
        city: true,
        state: true,
        status: true,
        createdAt: true,
        poster: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(listings);
  } catch (error) {
    console.error("GET /api/admin/listings error:", error);
    return Response.json(
      { error: "Failed to fetch pending listings" },
      { status: 500 }
    );
  }
}
