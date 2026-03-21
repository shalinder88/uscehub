import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const posters = await prisma.posterProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(posters);
  } catch (error) {
    console.error("GET /api/admin/posters error:", error);
    return Response.json(
      { error: "Failed to fetch pending posters" },
      { status: 500 }
    );
  }
}
