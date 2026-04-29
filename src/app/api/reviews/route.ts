export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { getSiteUrlFromEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-config";
import { rateLimit } from "@/lib/rate-limit";

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

    // Per-user rate limit (PR 0d audit H3): cap review submissions to
    // prevent automated spam. The applicant-create surface today is the
    // only entry; this is conservative on purpose.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, resetIn } = rateLimit(`reviews:${session.user.id}:${ip}`, {
      limit: 5,
      windowSeconds: 3600,
    });
    if (!allowed) {
      return Response.json(
        { error: "Too many review submissions. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(resetIn) },
        }
      );
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

    // PR 0d audit M3: only APPROVED listings may receive reviews. Without
    // this check a user with a listing id could review PENDING / REJECTED
    // / HIDDEN rows. Admin moderation later catches the orphan review,
    // but it leaks the listing's existence and lets a hidden listing
    // accumulate reviews while it's offline.
    if (listing.status !== "APPROVED") {
      return Response.json(
        { error: "Cannot review this listing" },
        { status: 400 }
      );
    }

    // PR 0d audit C1: a poster cannot review their own listing. Self-review
    // is the dominant abuse vector — admin moderation moderates content
    // honesty, not authorship, so a 5-star self-review survives moderation
    // and pollutes aggregate ratings + (when re-introduced) AggregateRating
    // structured data. Block at the source.
    if (listing.posterId === session.user.id) {
      return Response.json(
        { error: "You cannot review a listing you posted" },
        { status: 403 }
      );
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

    // Fire-and-forget admin notification
    const baseUrl = getSiteUrlFromEnv(SITE_URL);
    sendAdminNotification({
      kind: "review",
      subjectLine: `New review pending: ${listing.title}`,
      fromUserEmail: session.user.email,
      fromUserName: session.user.name,
      contextLines: [
        { label: "Listing", value: listing.title },
        { label: "Rating", value: `${overallRating}/5` },
        { label: "Recommend", value: wouldRecommend ? "Yes" : "No" },
      ],
      body: comment || undefined,
      reviewUrl: `${baseUrl}/admin/reviews`,
    }).catch((err) => console.error("[reviews] notify failed:", err));

    return Response.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return Response.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
