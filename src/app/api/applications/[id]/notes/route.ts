export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageListing } from "@/lib/institution";

// Add a coordinator note to an application. Only managers of the listing's
// organization (OWNER/COORDINATOR), the direct poster, or an admin may write.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const text = (body?.body ?? "").toString().trim();
    if (!text) {
      return Response.json({ error: "Note body required" }, { status: 400 });
    }
    if (text.length > 2000) {
      return Response.json({ error: "Note too long" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      select: { listingId: true },
    });
    if (!application) {
      return Response.json({ error: "Application not found" }, { status: 404 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const allowed = await canManageListing(session.user.id, application.listingId, isAdmin);
    if (!allowed) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const note = await prisma.applicationNote.create({
      data: { applicationId: id, authorId: session.user.id, body: text },
      include: { author: { select: { name: true } } },
    });

    return Response.json({
      id: note.id,
      body: note.body,
      authorName: note.author.name,
      createdAt: note.createdAt,
    });
  } catch (error) {
    console.error("POST /api/applications/[id]/notes error:", error);
    return Response.json({ error: "Failed to add note" }, { status: 500 });
  }
}
