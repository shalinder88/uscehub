export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { getSiteUrlFromEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, targetId, reason } = body;

    if (!type || !targetId || !reason) {
      return Response.json(
        { error: "type, targetId, and reason are required" },
        { status: 400 }
      );
    }

    if (typeof reason !== "string" || reason.length < 5 || reason.length > 2000) {
      return Response.json(
        { error: "reason must be between 5 and 2000 characters" },
        { status: 400 }
      );
    }

    const flag = await prisma.flagReport.create({
      data: {
        type,
        targetId,
        reporterId: session.user.id,
        reason,
        status: "OPEN",
      },
    });

    // Try to get listing title for the email
    let targetLabel = targetId;
    if (type === "listing") {
      const listing = await prisma.listing.findUnique({
        where: { id: targetId },
        select: { title: true, city: true, state: true },
      });
      if (listing) targetLabel = `${listing.title} (${listing.city}, ${listing.state})`;
    }

    const baseUrl = getSiteUrlFromEnv(SITE_URL);
    sendAdminNotification({
      kind: "flag",
      subjectLine: `New flag on ${type}: ${targetLabel.slice(0, 60)}`,
      fromUserEmail: session.user.email,
      fromUserName: session.user.name,
      contextLines: [
        { label: "Target type", value: type },
        { label: "Target", value: targetLabel },
      ],
      body: reason,
      reviewUrl: `${baseUrl}/admin/flags`,
    }).catch((err) => console.error("[flags] notify failed:", err));

    return Response.json(flag, { status: 201 });
  } catch (error) {
    console.error("POST /api/flags error:", error);
    return Response.json({ error: "Failed to create flag" }, { status: 500 });
  }
}
