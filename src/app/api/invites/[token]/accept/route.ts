export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Accept a coordinator invitation. The signed-in account's email must match
// the invited address: the token alone must not be enough to join an
// institution's team, since membership exposes applicant data.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) return Response.json({ error: "Sign in to accept" }, { status: 401 });

    const { token } = await params;
    const invite = await prisma.organizationInvite.findUnique({
      where: { token },
      include: { organization: { select: { id: true, name: true } } },
    });

    if (!invite) return Response.json({ error: "Invitation not found" }, { status: 404 });
    if (invite.status !== "PENDING") {
      return Response.json({ error: "This invitation is no longer active" }, { status: 409 });
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      return Response.json({ error: "This invitation has expired" }, { status: 409 });
    }

    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });
    if (!me) return Response.json({ error: "Account not found" }, { status: 404 });

    if (me.email.toLowerCase() !== invite.email.toLowerCase()) {
      return Response.json(
        { error: `This invitation was sent to ${invite.email}. Sign in with that address to accept it.` },
        { status: 403 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: me.id }, data: { role: "POSTER" } });
      await tx.organizationMembership.upsert({
        where: { organizationId_userId: { organizationId: invite.organizationId, userId: me.id } },
        update: {},
        create: {
          organizationId: invite.organizationId,
          userId: me.id,
          role: invite.role,
          title: invite.title,
          invitedByEmail: null,
        },
      });
      await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED", acceptedAt: new Date() },
      });
    });

    return Response.json({ ok: true, organizationName: invite.organization.name });
  } catch (error) {
    console.error("POST /api/invites/[token]/accept error:", error);
    return Response.json({ error: "Failed to accept invitation" }, { status: 500 });
  }
}
