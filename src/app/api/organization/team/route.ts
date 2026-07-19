export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { resolveInstitutionContext } from "@/lib/institution";
import { sendCoordinatorInvite } from "@/lib/email";
import { getSiteUrlFromEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-config";

const MANAGEABLE_ROLES = ["COORDINATOR", "VIEWER"];
const ROLE_LABEL: Record<string, string> = { COORDINATOR: "Coordinator", VIEWER: "Viewer" };
const INVITE_TTL_DAYS = 14;

async function requireOwner() {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized", status: 401 as const };
  const ctx = await resolveInstitutionContext(session.user.id);
  if (!ctx) return { error: "No organization", status: 404 as const };
  if (ctx.role !== "OWNER") return { error: "Only the owner can manage the team", status: 403 as const };
  return { orgId: ctx.org.id, userId: session.user.id };
}

// Add an existing registered user to the org as COORDINATOR or VIEWER.
export async function POST(request: NextRequest) {
  try {
    const gate = await requireOwner();
    if ("error" in gate) return Response.json({ error: gate.error }, { status: gate.status });

    const body = await request.json();
    const email = (body?.email ?? "").toString().trim().toLowerCase();
    const role = (body?.role ?? "COORDINATOR").toString();
    const title = (body?.title ?? "").toString().trim() || null;

    if (!email) return Response.json({ error: "Email required" }, { status: 400 });
    if (!MANAGEABLE_ROLES.includes(role)) return Response.json({ error: "Invalid role" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });

    // No account yet -> create a tokenized invitation and email it.
    if (!user) {
      const pending = await prisma.organizationInvite.findFirst({
        where: { organizationId: gate.orgId, email, status: "PENDING" },
      });
      if (pending) {
        return Response.json({ error: "An invitation is already pending for that email" }, { status: 409 });
      }

      const inviter = await prisma.user.findUnique({ where: { id: gate.userId }, select: { name: true } });
      const org = await prisma.organization.findUnique({ where: { id: gate.orgId }, select: { name: true } });
      const token = randomBytes(24).toString("hex");
      const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

      const invite = await prisma.organizationInvite.create({
        data: {
          organizationId: gate.orgId,
          email,
          role,
          title,
          token,
          invitedById: gate.userId,
          expiresAt,
        },
      });

      const acceptUrl = `${getSiteUrlFromEnv(SITE_URL)}/invite/${token}`;
      const { sent } = await sendCoordinatorInvite({
        to: email,
        organizationName: org?.name ?? "your institution",
        inviterName: inviter?.name ?? "A colleague",
        roleLabel: ROLE_LABEL[role] ?? role,
        acceptUrl,
      });

      return Response.json({
        invited: true,
        id: invite.id,
        email,
        role,
        emailSent: sent,
        acceptUrl,
        expiresAt: invite.expiresAt,
      });
    }

    const existing = await prisma.organizationMembership.findUnique({
      where: { organizationId_userId: { organizationId: gate.orgId, userId: user.id } },
    });
    if (existing) return Response.json({ error: "Already a team member" }, { status: 409 });

    // Ensure the added user can reach the poster surface.
    await prisma.user.update({ where: { id: user.id }, data: { role: "POSTER" } });

    const m = await prisma.organizationMembership.create({
      data: { organizationId: gate.orgId, userId: user.id, role, title, invitedByEmail: null },
    });

    return Response.json({ id: m.id, name: user.name, email: user.email, role: m.role, title: m.title });
  } catch (error) {
    console.error("POST /api/organization/team error:", error);
    return Response.json({ error: "Failed to add member" }, { status: 500 });
  }
}

// Change a member's role.
export async function PATCH(request: NextRequest) {
  try {
    const gate = await requireOwner();
    if ("error" in gate) return Response.json({ error: gate.error }, { status: gate.status });

    const body = await request.json();
    const membershipId = (body?.membershipId ?? "").toString();
    const role = (body?.role ?? "").toString();
    if (!MANAGEABLE_ROLES.includes(role)) return Response.json({ error: "Invalid role" }, { status: 400 });

    const m = await prisma.organizationMembership.findUnique({ where: { id: membershipId } });
    if (!m || m.organizationId !== gate.orgId) return Response.json({ error: "Not found" }, { status: 404 });
    if (m.role === "OWNER") return Response.json({ error: "Cannot change the owner's role" }, { status: 403 });

    const updated = await prisma.organizationMembership.update({ where: { id: membershipId }, data: { role } });
    return Response.json({ id: updated.id, role: updated.role });
  } catch (error) {
    console.error("PATCH /api/organization/team error:", error);
    return Response.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// Remove a member (never the owner).
export async function DELETE(request: NextRequest) {
  try {
    const gate = await requireOwner();
    if ("error" in gate) return Response.json({ error: gate.error }, { status: gate.status });

    const body = await request.json();
    const inviteId = (body?.inviteId ?? "").toString();

    // Revoking a pending invitation.
    if (inviteId) {
      const inv = await prisma.organizationInvite.findUnique({ where: { id: inviteId } });
      if (!inv || inv.organizationId !== gate.orgId) return Response.json({ error: "Not found" }, { status: 404 });
      await prisma.organizationInvite.update({ where: { id: inviteId }, data: { status: "REVOKED" } });
      return Response.json({ ok: true });
    }

    const membershipId = (body?.membershipId ?? "").toString();
    const m = await prisma.organizationMembership.findUnique({ where: { id: membershipId } });
    if (!m || m.organizationId !== gate.orgId) return Response.json({ error: "Not found" }, { status: 404 });
    if (m.role === "OWNER") return Response.json({ error: "Cannot remove the owner" }, { status: 403 });

    await prisma.organizationMembership.delete({ where: { id: membershipId } });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/organization/team error:", error);
    return Response.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
