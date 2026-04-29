export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  sanitizeListingPatchForRole,
  getStrippedListingFields,
  type Role,
} from "@/lib/listing-update-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        organization: true,
        poster: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          where: { moderationStatus: "APPROVED" },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
            applications: true,
            savedBy: true,
          },
        },
      },
    });

    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    // Increment views in the background
    prisma.listing
      .update({
        where: { id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});

    return Response.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
    return Response.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

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

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.posterId !== session.user.id && session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Role-aware field allowlist (PR 0a-fix-1, PR #32 critical gap C1).
    // Posters may only patch content fields; admin moderation, trust,
    // verification, featured, and admin-notes fields are admin-only.
    // See src/lib/listing-update-guard.ts.
    const role = (session.user.role ?? "APPLICANT") as Role;
    const updateData = sanitizeListingPatchForRole(body, role);

    // Telemetry-only: log keys the poster attempted to set but were
    // stripped, so audit can detect malicious or buggy clients.
    if (role !== "ADMIN") {
      const stripped = getStrippedListingFields(body, role);
      if (stripped.length > 0) {
        console.warn(
          `[listings PATCH] poster ${session.user.id} attempted to set restricted fields on listing ${id}:`,
          stripped.join(", "),
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No editable fields provided" }, { status: 400 });
    }

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
    });

    return Response.json(updated);
  } catch (error) {
    console.error("PATCH /api/listings/[id] error:", error);
    return Response.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const listing = await prisma.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.posterId !== session.user.id && session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return Response.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
