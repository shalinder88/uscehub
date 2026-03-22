export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const type = searchParams.get("type");
    const state = searchParams.get("state");
    const specialty = searchParams.get("specialty");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (type) {
      where.listingType = type;
    }

    if (state) {
      where.state = state;
    }

    if (specialty) {
      where.specialty = { contains: specialty };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { city: { contains: search } },
        { specialty: { contains: search } },
      ];
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "views":
        orderBy = { views: "desc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              verificationStatus: true,
              badges: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              applications: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return Response.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/listings error:", error);
    return Response.json(
      { error: "Failed to fetch listings" },
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

    if (session.user.role !== "POSTER" && session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Only posters can create listings" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      listingType,
      specialty,
      city,
      state,
      country,
      format,
      shortDescription,
      fullDescription,
      duration,
      cost,
      applicationMethod,
      contactEmail,
      eligibilitySummary,
      startDate,
      applicationDeadline,
      certificateOffered,
      lorPossible,
      visaSupport,
      housingSupport,
      websiteUrl,
      numberOfSpots,
      supervisingPhysician,
      graduationYearPref,
      stepRequirements,
      ecfmgRequired,
      organizationId,
    } = body;

    if (!title || !listingType || !specialty || !city || !state || !shortDescription || !duration || !cost) {
      return Response.json(
        { error: "Missing required fields: title, listingType, specialty, city, state, shortDescription, duration, cost" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        listingType,
        specialty,
        city,
        state,
        country: country || "USA",
        format: format || "IN_PERSON",
        shortDescription,
        fullDescription,
        duration,
        cost,
        applicationMethod: applicationMethod || "platform",
        contactEmail,
        eligibilitySummary,
        startDate,
        applicationDeadline,
        certificateOffered: certificateOffered || false,
        lorPossible: lorPossible || false,
        visaSupport: visaSupport || false,
        housingSupport,
        websiteUrl,
        numberOfSpots,
        supervisingPhysician,
        graduationYearPref,
        stepRequirements,
        ecfmgRequired,
        organizationId,
        posterId: session.user.id,
        status: session.user.role === "ADMIN" ? "APPROVED" : "PENDING",
      },
    });

    return Response.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings error:", error);
    return Response.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
