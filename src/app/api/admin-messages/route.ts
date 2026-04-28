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
    const { category, subject, body: messageBody } = body;

    if (!subject || !messageBody) {
      return Response.json(
        { error: "subject and body are required" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return Response.json({ error: "subject too long (max 200)" }, { status: 400 });
    }
    if (messageBody.length < 10 || messageBody.length > 5000) {
      return Response.json(
        { error: "body must be 10-5000 characters" },
        { status: 400 }
      );
    }

    const msg = await prisma.adminMessage.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name,
        category: category || "general",
        subject,
        body: messageBody,
        status: "OPEN",
      },
    });

    const baseUrl = getSiteUrlFromEnv(SITE_URL);
    sendAdminNotification({
      kind: "contact",
      subjectLine: `User message [${msg.category}]: ${subject.slice(0, 60)}`,
      fromUserEmail: session.user.email,
      fromUserName: session.user.name,
      contextLines: [
        { label: "Category", value: msg.category },
        { label: "Subject", value: subject },
      ],
      body: messageBody,
      reviewUrl: `${baseUrl}/admin/messages`,
    }).catch((err) => console.error("[admin-messages] notify failed:", err));

    // Return only non-sensitive fields
    return Response.json(
      { id: msg.id, status: msg.status, createdAt: msg.createdAt },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin-messages error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
