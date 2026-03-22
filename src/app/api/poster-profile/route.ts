export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.posterProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error("GET /api/poster-profile error:", error);
    return Response.json(
      { error: "Failed to fetch poster profile" },
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

    const body = await request.json();
    const { npiNumber, institutionalEmail, contactName, phone, title } = body;

    const profile = await prisma.posterProfile.upsert({
      where: { userId: session.user.id },
      update: {
        npiNumber: npiNumber ?? undefined,
        institutionalEmail: institutionalEmail ?? undefined,
        contactName: contactName ?? undefined,
        phone: phone ?? undefined,
        title: title ?? undefined,
        verificationStatus:
          npiNumber || institutionalEmail ? "PENDING" : undefined,
      },
      create: {
        userId: session.user.id,
        npiNumber: npiNumber || null,
        institutionalEmail: institutionalEmail || null,
        contactName: contactName || null,
        phone: phone || null,
        title: title || null,
        verificationStatus:
          npiNumber || institutionalEmail ? "PENDING" : "UNVERIFIED",
      },
    });

    return Response.json(profile);
  } catch (error) {
    console.error("PATCH /api/poster-profile error:", error);
    return Response.json(
      { error: "Failed to update poster profile" },
      { status: 500 }
    );
  }
}
