export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        listing: {
          select: { posterId: true },
        },
      },
    });

    if (!application) {
      return Response.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Only the listing poster or admin can update application status
    const isPoster = application.listing.posterId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const isApplicant = application.applicantId === session.user.id;

    if (!isPoster && !isAdmin && !isApplicant) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Applicants can only withdraw
    if (isApplicant && !isPoster && !isAdmin && status !== "WITHDRAWN") {
      return Response.json(
        { error: "Applicants can only withdraw their applications" },
        { status: 403 }
      );
    }

    const validStatuses = [
      "SUBMITTED",
      "UNDER_REVIEW",
      "ACCEPTED",
      "REJECTED",
      "COMPLETED",
      "WITHDRAWN",
    ];

    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return Response.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
