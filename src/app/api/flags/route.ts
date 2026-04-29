export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendAdminNotification } from "@/lib/email";
import { getSiteUrlFromEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site-config";
import { rateLimit } from "@/lib/rate-limit";
import type { FlagKind } from "@prisma/client";

// FlagKind enum values, validated server-side against arbitrary user input.
// Phase 3.8: PR #7 added the structured kind column; this route never
// populated it, so user-submitted broken-link reports fell back to the
// schema default (OTHER) and the admin queue could not filter by kind.
const ALLOWED_FLAG_KINDS: ReadonlySet<string> = new Set<FlagKind>([
  "BROKEN_LINK",
  "WRONG_DEADLINE",
  "PROGRAM_CLOSED",
  "INCORRECT_INFO",
  "DUPLICATE",
  "SPAM",
  "OTHER",
]);
const BROKEN_LINK_PREFIX = "[broken_link]";

function resolveKind(rawKind: unknown, reason: string): FlagKind {
  // 1. Trust an explicit, validated kind from the body.
  if (typeof rawKind === "string" && ALLOWED_FLAG_KINDS.has(rawKind)) {
    return rawKind as FlagKind;
  }
  // 2. Back-compat: parse the legacy "[broken_link] ..." reason prefix.
  //    Older clients (and the original ReportBrokenLinkButton spec
  //    documented in PHASE3 plan §6) signaled the kind via this prefix.
  if (reason.startsWith(BROKEN_LINK_PREFIX)) return "BROKEN_LINK";
  // 3. Default. Schema default is OTHER too, but make it explicit so the
  //    audit trail and any future client-side validation see the same
  //    value.
  return "OTHER";
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limit (PR 0d audit H3): cap flag submissions so a
    // single user cannot mass-spam reports. Higher cap than reviews
    // because legitimate users may report several stale links in one
    // session.
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed, resetIn } = rateLimit(`flags:${session.user.id}:${ip}`, {
      limit: 20,
      windowSeconds: 3600,
    });
    if (!allowed) {
      return Response.json(
        { error: "Too many flag submissions. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(resetIn) },
        }
      );
    }

    const body = await request.json();
    const { type, targetId, reason, kind: rawKind, sourceUrl: rawSourceUrl } = body;

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

    const kind = resolveKind(rawKind, reason);
    const sourceUrl =
      typeof rawSourceUrl === "string" && rawSourceUrl.length > 0 && rawSourceUrl.length <= 2048
        ? rawSourceUrl
        : null;

    const flag = await prisma.flagReport.create({
      data: {
        type,
        targetId,
        reporterId: session.user.id,
        reason,
        status: "OPEN",
        kind,
        sourceUrl,
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
