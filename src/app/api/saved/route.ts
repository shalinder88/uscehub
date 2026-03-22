export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedListings = await prisma.savedListing.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          include: {
            organization: {
              select: { id: true, name: true },
            },
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(savedListings);
  } catch (error) {
    console.error("GET /api/saved error:", error);
    return Response.json(
      { error: "Failed to fetch saved listings" },
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

    const body = await request.json();
    const { listingId } = body;

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

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "Listing already saved" },
        { status: 409 }
      );
    }

    const saved = await prisma.savedListing.create({
      data: {
        userId: session.user.id,
        listingId,
      },
    });

    return Response.json(saved, { status: 201 });
  } catch (error) {
    console.error("POST /api/saved error:", error);
    return Response.json(
      { error: "Failed to save listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return Response.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    if (!existing) {
      return Response.json(
        { error: "Listing not saved" },
        { status: 404 }
      );
    }

    await prisma.savedListing.delete({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/saved error:", error);
    return Response.json(
      { error: "Failed to unsave listing" },
      { status: 500 }
    );
  }
}
