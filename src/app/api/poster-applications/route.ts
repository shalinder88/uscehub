export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "POSTER" && session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await prisma.application.findMany({
      where: {
        listing: { posterId: session.user.id },
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            applicantProfile: {
              select: {
                medicalSchool: true,
                specialtyInterest: true,
                usmleStep1: true,
                usmleStep2: true,
                country: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(applications);
  } catch (error) {
    console.error("GET /api/poster-applications error:", error);
    return Response.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
