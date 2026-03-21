import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const listingId = searchParams.get("listingId");

    if (listingId) {
      // Poster viewing applications for their listing
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (!listing) {
        return Response.json({ error: "Listing not found" }, { status: 404 });
      }

      if (listing.posterId !== session.user.id && session.user.role !== "ADMIN") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }

      const applications = await prisma.application.findMany({
        where: { listingId },
        include: {
          applicant: {
            select: {
              id: true,
              name: true,
              email: true,
              applicantProfile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return Response.json(applications);
    }

    // Applicant viewing their own applications
    const applications = await prisma.application.findMany({
      where: { applicantId: session.user.id },
      include: {
        listing: {
          include: {
            organization: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return Response.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "APPLICANT") {
      return Response.json(
        { error: "Only applicants can apply" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { listingId, message } = body;

    if (!listingId) {
      return Response.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "APPROVED") {
      return Response.json(
        { error: "Cannot apply to this listing" },
        { status: 400 }
      );
    }

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        listingId_applicantId: {
          listingId,
          applicantId: session.user.id,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "You have already applied to this listing" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        listingId,
        applicantId: session.user.id,
        message: message || null,
      },
    });

    return Response.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return Response.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
