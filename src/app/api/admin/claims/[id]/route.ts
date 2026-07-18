export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function hostOf(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : email.toLowerCase();
}

// Approve or reject a claim. On approval: ensure the claimant has a verified
// organization + an OrganizationMembership so they can manage the program.
// Grants the right to manage information — never an endorsement.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const action = (body?.action ?? "").toString();
    const reviewNotes = (body?.reviewNotes ?? "").toString().trim() || null;

    const claim = await prisma.organizationClaim.findUnique({
      where: { id },
      include: { listing: { select: { id: true, city: true, state: true, organizationId: true } } },
    });
    if (!claim) return Response.json({ error: "Claim not found" }, { status: 404 });
    if (claim.status !== "PENDING") return Response.json({ error: "Claim already reviewed" }, { status: 409 });

    if (action === "reject") {
      await prisma.organizationClaim.update({ where: { id }, data: { status: "REJECTED", reviewNotes } });
      return Response.json({ status: "REJECTED" });
    }
    if (action !== "approve") {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Resolve the target organization.
      let orgId = claim.organizationId ?? claim.listing?.organizationId ?? null;
      let grantedRole: "OWNER" | "COORDINATOR" = "COORDINATOR";

      if (!orgId) {
        // Mode A: no org yet. Create one owned by the claimant — unless they
        // already own an org (ownerId is unique), in which case reuse it.
        const alreadyOwned = await tx.organization.findUnique({ where: { ownerId: claim.claimantId } });
        if (alreadyOwned) {
          orgId = alreadyOwned.id;
          grantedRole = "OWNER";
        } else {
          const created = await tx.organization.create({
            data: {
              ownerId: claim.claimantId,
              name: claim.institutionName,
              city: claim.listing?.city ?? "",
              state: claim.listing?.state ?? "",
              website: `https://${hostOf(claim.institutionEmail)}`,
              institutionalEmail: true,
              verificationStatus: "APPROVED",
              badges: "institutional_email",
            },
          });
          orgId = created.id;
          grantedRole = "OWNER";
        }
      }

      // Ensure the claimant can reach the poster surface.
      await tx.user.update({ where: { id: claim.claimantId }, data: { role: "POSTER" } });

      // Grant membership (idempotent).
      await tx.organizationMembership.upsert({
        where: { organizationId_userId: { organizationId: orgId, userId: claim.claimantId } },
        update: {},
        create: { organizationId: orgId, userId: claim.claimantId, role: grantedRole, title: claim.title },
      });

      // Link the claimed listing to the org if not already.
      if (claim.listing && !claim.listing.organizationId) {
        await tx.listing.update({ where: { id: claim.listing.id }, data: { organizationId: orgId } });
      }

      await tx.organizationClaim.update({
        where: { id },
        data: { status: "APPROVED", organizationId: orgId, reviewNotes },
      });

      await tx.adminActionLog.create({
        data: {
          adminId: session.user.id,
          action: "APPROVE_CLAIM",
          targetType: "OrganizationClaim",
          targetId: id,
          notes: `Granted ${grantedRole} on org ${orgId} to ${claim.institutionEmail}`,
        },
      });

      return { orgId, grantedRole };
    });

    return Response.json({ status: "APPROVED", ...result });
  } catch (error) {
    console.error("POST /api/admin/claims/[id] error:", error);
    return Response.json({ error: "Failed to review claim" }, { status: 500 });
  }
}
