import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(reviews);
  } catch (error) {
    console.error("GET /api/my-reviews error:", error);
    return Response.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
