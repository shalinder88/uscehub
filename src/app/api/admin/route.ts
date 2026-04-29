export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return Response.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetId, notes } = body;

    if (!action || !targetId) {
      return Response.json(
        { error: "action and targetId are required" },
        { status: 400 }
      );
    }

    // Build the state-change query without awaiting, so it can run
    // atomically with the AdminActionLog write inside a $transaction
    // (PR 0a-fix-4, PR #32 low gap L1: previously the admin update
    // and the audit-log write were sequential, leaving a crash window
    // that could orphan a state change without an audit row).
    let updateQuery: Prisma.PrismaPromise<unknown>;
    let targetType: string;

    switch (action) {
      case "approve_poster": {
        targetType = "poster_profile";
        updateQuery = prisma.posterProfile.update({
          where: { id: targetId },
          data: {
            verificationStatus: "APPROVED",
            adminNotes: notes || null,
          },
        });
        break;
      }

      case "reject_poster": {
        targetType = "poster_profile";
        updateQuery = prisma.posterProfile.update({
          where: { id: targetId },
          data: {
            verificationStatus: "REJECTED",
            adminNotes: notes || null,
          },
        });
        break;
      }

      case "approve_listing": {
        targetType = "listing";
        updateQuery = prisma.listing.update({
          where: { id: targetId },
          data: {
            status: "APPROVED",
            adminNotes: notes || null,
          },
        });
        break;
      }

      case "reject_listing": {
        targetType = "listing";
        updateQuery = prisma.listing.update({
          where: { id: targetId },
          data: {
            status: "REJECTED",
            adminNotes: notes || null,
          },
        });
        break;
      }

      case "hide_listing": {
        targetType = "listing";
        updateQuery = prisma.listing.update({
          where: { id: targetId },
          data: {
            status: "HIDDEN",
            adminNotes: notes || null,
          },
        });
        break;
      }

      case "approve_review": {
        targetType = "review";
        updateQuery = prisma.review.update({
          where: { id: targetId },
          data: {
            moderationStatus: "APPROVED",
          },
        });
        break;
      }

      case "reject_review": {
        targetType = "review";
        updateQuery = prisma.review.update({
          where: { id: targetId },
          data: {
            moderationStatus: "REJECTED",
          },
        });
        break;
      }

      default:
        return Response.json(
          {
            error: `Unknown action: ${action}. Valid actions: approve_poster, reject_poster, approve_listing, reject_listing, hide_listing, approve_review, reject_review`,
          },
          { status: 400 }
        );
    }

    const logQuery = prisma.adminActionLog.create({
      data: {
        adminId: session.user.id,
        action,
        targetType,
        targetId,
        notes: notes || null,
      },
    });

    // Atomic: state change + audit log either both commit or both
    // roll back. Closes the L1 gap (orphan state change with missing
    // audit row).
    const [result] = await prisma.$transaction([updateQuery, logQuery]);

    return Response.json({ success: true, result });
  } catch (error) {
    console.error("POST /api/admin error:", error);
    return Response.json(
      { error: "Failed to perform admin action" },
      { status: 500 }
    );
  }
}
