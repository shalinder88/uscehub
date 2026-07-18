export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function hostOf(value: string | null | undefined): string | null {
  if (!value) return null;
  let v = value.trim().toLowerCase();
  const at = v.lastIndexOf("@");
  if (at >= 0) v = v.slice(at + 1); // email → domain
  v = v.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  return v || null;
}

// Submit a claim to manage a listing's program. Conservative: creates a
// PENDING claim for admin review. Verification grants the right to manage
// information, never an endorsement label.
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Sign in to claim a program" }, { status: 401 });
    }

    const body = await request.json();
    const listingId = (body?.listingId ?? "").toString();
    const contactName = (body?.contactName ?? "").toString().trim();
    const institutionName = (body?.institutionName ?? "").toString().trim();
    const institutionEmail = (body?.institutionEmail ?? "").toString().trim().toLowerCase();
    const title = (body?.title ?? "").toString().trim() || null;
    const message = (body?.message ?? "").toString().trim() || null;

    if (!contactName || !institutionName || !institutionEmail) {
      return Response.json({ error: "Name, institution, and institutional email are required" }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(institutionEmail)) {
      return Response.json({ error: "Enter a valid institutional email" }, { status: 400 });
    }

    const listing = listingId
      ? await prisma.listing.findUnique({
          where: { id: listingId },
          select: { id: true, organizationId: true, websiteUrl: true, organization: { select: { website: true } } },
        })
      : null;
    if (listingId && !listing) {
      return Response.json({ error: "Listing not found" }, { status: 404 });
    }

    const existing = await prisma.organizationClaim.findFirst({
      where: { claimantId: session.user.id, listingId: listing?.id ?? undefined, status: "PENDING" },
    });
    if (existing) {
      return Response.json({ error: "You already have a pending claim for this program" }, { status: 409 });
    }

    const emailHost = hostOf(institutionEmail);
    const siteHost = hostOf(listing?.organization?.website ?? listing?.websiteUrl ?? null);
    const domainMatch = !!emailHost && !!siteHost && emailHost === siteHost;

    const claim = await prisma.organizationClaim.create({
      data: {
        listingId: listing?.id ?? null,
        organizationId: listing?.organizationId ?? null,
        claimantId: session.user.id,
        contactName,
        institutionName,
        institutionEmail,
        title,
        message,
        domainMatch,
        status: "PENDING",
      },
    });

    return Response.json({ id: claim.id, domainMatch });
  } catch (error) {
    console.error("POST /api/claims error:", error);
    return Response.json({ error: "Failed to submit claim" }, { status: 500 });
  }
}
