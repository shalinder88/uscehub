import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const listingId = searchParams.get("listingId");

    if (!listingId) {
      return Response.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        listingId,
        moderationStatus: "APPROVED",
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask user info for anonymous reviews
    const sanitized = reviews.map((review) => ({
      ...review,
      user: review.anonymous
        ? { id: "anonymous", name: "Anonymous" }
        : review.user,
    }));

    // Compute aggregate stats
    const stats = {
      count: reviews.length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
          : 0,
      wouldRecommendPercent:
        reviews.length > 0
          ? (reviews.filter((r) => r.wouldRecommend).length / reviews.length) * 100
          : 0,
    };

    return Response.json({ reviews: sanitized, stats });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return Response.json(
      { error: "Failed to fetch reviews" },
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
    const {
      listingId,
      overallRating,
      wasReal,
      worthCost,
      actualExposure,
      wouldRecommend,
      comment,
      anonymous,
    } = body;

    if (!listingId || overallRating === undefined) {
      return Response.json(
        { error: "listingId and overallRating are required" },
        { status: 400 }
      );
    }

    if (overallRating < 1 || overallRating > 5) {
      return Response.json(
        { error: "overallRating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Check for existing review
    const existing = await prisma.review.findUnique({
      where: {
        listingId_userId: {
          listingId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "You have already reviewed this listing" },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        listingId,
        userId: session.user.id,
        overallRating,
        wasReal: wasReal ?? true,
        worthCost: worthCost ?? true,
        actualExposure: actualExposure ?? 3,
        wouldRecommend: wouldRecommend ?? true,
        comment: comment || null,
        anonymous: anonymous ?? false,
        moderationStatus: "PENDING",
      },
    });

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return Response.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
