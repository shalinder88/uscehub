export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const ownerId = searchParams.get("ownerId");

    if (ownerId) {
      const organization = await prisma.organization.findUnique({
        where: { ownerId },
        include: {
          listings: {
            select: {
              id: true,
              title: true,
              status: true,
              listingType: true,
              views: true,
              createdAt: true,
              _count: {
                select: { applications: true, reviews: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!organization) {
        return Response.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      return Response.json(organization);
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: { listings: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return Response.json(organizations);
  } catch (error) {
    console.error("GET /api/organizations error:", error);
    return Response.json(
      { error: "Failed to fetch organizations" },
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
        { error: "Only posters can create organizations" },
        { status: 403 }
      );
    }

    // Check if user already has an organization
    const existing = await prisma.organization.findUnique({
      where: { ownerId: session.user.id },
    });

    if (existing) {
      return Response.json(
        { error: "You already have an organization. Use PATCH to update it." },
        { status: 409 }
      );
    }

    const body = await request.json();
    const {
      name,
      type,
      contactName,
      contactEmail,
      phone,
      website,
      city,
      state,
      description,
    } = body;

    if (!name || !city || !state) {
      return Response.json(
        { error: "name, city, and state are required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        ownerId: session.user.id,
        name,
        type: type || null,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        phone: phone || null,
        website: website || null,
        city,
        state,
        description: description || null,
      },
    });

    return Response.json(organization, { status: 201 });
  } catch (error) {
    console.error("POST /api/organizations error:", error);
    return Response.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { ownerId: session.user.id },
    });

    if (!organization && session.user.role !== "ADMIN") {
      return Response.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id: targetId, ...updateData } = body;

    // Admin can update any org by passing id
    const orgId = session.user.role === "ADMIN" && targetId
      ? targetId
      : organization?.id;

    if (!orgId) {
      return Response.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.ownerId;
    delete updateData.createdAt;

    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/organizations error:", error);
    return Response.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}
