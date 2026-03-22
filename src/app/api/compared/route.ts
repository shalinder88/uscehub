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

    const comparedListings = await prisma.comparedListing.findMany({
      where: { userId: session.user.id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            listingType: true,
            specialty: true,
            city: true,
            state: true,
            duration: true,
            cost: true,
            certificateOffered: true,
            lorPossible: true,
            visaSupport: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return Response.json(comparedListings);
  } catch (error) {
    console.error("GET /api/compared error:", error);
    return Response.json(
      { error: "Failed to fetch compared listings" },
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

    const count = await prisma.comparedListing.count({
      where: { userId: session.user.id },
    });

    if (count >= 3) {
      return Response.json(
        { error: "You can compare up to 3 listings at a time" },
        { status: 400 }
      );
    }

    const existing = await prisma.comparedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "Listing already in comparison" },
        { status: 409 }
      );
    }

    const compared = await prisma.comparedListing.create({
      data: {
        userId: session.user.id,
        listingId,
      },
    });

    return Response.json(compared, { status: 201 });
  } catch (error) {
    console.error("POST /api/compared error:", error);
    return Response.json(
      { error: "Failed to add to comparison" },
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

    await prisma.comparedListing.delete({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId,
        },
      },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/compared error:", error);
    return Response.json(
      { error: "Failed to remove from comparison" },
      { status: 500 }
    );
  }
}
