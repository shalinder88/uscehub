import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const reviews = await prisma.review.findMany({
      where: { moderationStatus: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true },
        },
        listing: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(reviews);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return Response.json(
      { error: "Failed to fetch pending reviews" },
      { status: 500 }
    );
  }
}
