export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { LinkVerificationStatus, FlagStatus, Prisma } from "@prisma/client";

/**
 * Admin verification queue (Phase 3.4).
 *
 * GET  → returns the two queue sources the admin reviews:
 *          - user-submitted FlagReports with status OPEN or IN_REVIEW
 *          - Listings the cron classified NEEDS_MANUAL_REVIEW
 *        plus an "aged REVERIFYING" list (transient failures stuck >14 days).
 *
 * POST → applies a single admin action.
 *        Body: { kind: "flag" | "listing", id, action, notes? }
 *        Each mutation is atomic via prisma.$transaction:
 *          - update target row(s)
 *          - write DataVerification audit row when listing status changes
 *          - write AdminActionLog
 *
 * Conservative contract preserved:
 *   - `Listing.status` is never modified here (no auto-hide).
 *   - URL fields are never rewritten.
 *   - `lastVerifiedAt` only advances when the new linkVerificationStatus
 *     is VERIFIED.
 *   - SOURCE_DEAD / PROGRAM_CLOSED / NO_OFFICIAL_SOURCE require an
 *     explicit admin action with audit trail; they are never set
 *     automatically by this endpoint.
 */

const REVERIFYING_AGE_THRESHOLD_DAYS = 14;
const VERIFIED_BY_ADMIN_PREFIX = "admin:";

type FlagAction =
  | "in_review"
  | "resolve_verified"
  | "resolve_source_dead"
  | "resolve_program_closed"
  | "dismiss";

type ListingAction =
  | "mark_verified"
  | "mark_needs_review"
  | "mark_source_dead"
  | "mark_program_closed"
  | "mark_no_official_source";

const FLAG_ACTIONS: ReadonlySet<string> = new Set<FlagAction>([
  "in_review",
  "resolve_verified",
  "resolve_source_dead",
  "resolve_program_closed",
  "dismiss",
]);

const LISTING_ACTIONS: ReadonlySet<string> = new Set<ListingAction>([
  "mark_verified",
  "mark_needs_review",
  "mark_source_dead",
  "mark_program_closed",
  "mark_no_official_source",
]);

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const flagReports = await prisma.flagReport.findMany({
    where: { status: { in: ["OPEN", "IN_REVIEW"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      reporter: { select: { id: true, name: true, email: true } },
    },
  });

  const listingTargetIds = flagReports
    .filter((f) => f.type === "listing")
    .map((f) => f.targetId);

  const listingsForFlags = listingTargetIds.length
    ? await prisma.listing.findMany({
        where: { id: { in: listingTargetIds } },
        select: {
          id: true,
          title: true,
          city: true,
          state: true,
          specialty: true,
          status: true,
          linkVerificationStatus: true,
          lastVerifiedAt: true,
          lastVerificationAttemptAt: true,
          verificationFailureReason: true,
          sourceUrl: true,
          applicationUrl: true,
          websiteUrl: true,
        },
      })
    : [];
  const listingByIdForFlags = new Map(listingsForFlags.map((l) => [l.id, l]));

  const flagReportsWithListing = flagReports.map((f) => ({
    ...f,
    listing: f.type === "listing" ? listingByIdForFlags.get(f.targetId) ?? null : null,
  }));

  const listingsNeedingReview = await prisma.listing.findMany({
    where: { linkVerificationStatus: "NEEDS_MANUAL_REVIEW" },
    orderBy: { lastVerificationAttemptAt: "desc" },
    select: {
      id: true,
      title: true,
      city: true,
      state: true,
      specialty: true,
      linkVerificationStatus: true,
      lastVerifiedAt: true,
      lastVerificationAttemptAt: true,
      verificationFailureReason: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
    },
  });

  const reverifyingThreshold = new Date(
    Date.now() - REVERIFYING_AGE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
  );
  const agedReverifying = await prisma.listing.findMany({
    where: {
      linkVerificationStatus: "REVERIFYING",
      lastVerificationAttemptAt: { lt: reverifyingThreshold },
    },
    orderBy: { lastVerificationAttemptAt: "asc" },
    select: {
      id: true,
      title: true,
      city: true,
      state: true,
      specialty: true,
      linkVerificationStatus: true,
      lastVerifiedAt: true,
      lastVerificationAttemptAt: true,
      verificationFailureReason: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
    },
  });

  const recentVerificationsRaw = await prisma.dataVerification.findMany({
    where: {
      targetType: "listing",
      targetId: {
        in: [
          ...listingsNeedingReview.map((l) => l.id),
          ...agedReverifying.map((l) => l.id),
          ...flagReportsWithListing.flatMap((f) => (f.listing ? [f.listing.id] : [])),
        ],
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetId: true,
      verifiedBy: true,
      method: true,
      statusBefore: true,
      statusAfter: true,
      httpStatus: true,
      finalUrl: true,
      errorMessage: true,
      createdAt: true,
    },
  });
  const recentVerificationsByListing = new Map<string, typeof recentVerificationsRaw>();
  for (const row of recentVerificationsRaw) {
    const arr = recentVerificationsByListing.get(row.targetId) ?? [];
    if (arr.length < 3) {
      arr.push(row);
      recentVerificationsByListing.set(row.targetId, arr);
    }
  }

  return Response.json({
    flagReports: flagReportsWithListing.map((f) => ({
      ...f,
      recentVerifications: f.listing
        ? recentVerificationsByListing.get(f.listing.id) ?? []
        : [],
    })),
    listingsNeedingReview: listingsNeedingReview.map((l) => ({
      ...l,
      recentVerifications: recentVerificationsByListing.get(l.id) ?? [],
    })),
    agedReverifying: agedReverifying.map((l) => ({
      ...l,
      recentVerifications: recentVerificationsByListing.get(l.id) ?? [],
    })),
    counts: {
      flagReports: flagReportsWithListing.length,
      listingsNeedingReview: listingsNeedingReview.length,
      agedReverifying: agedReverifying.length,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Body must be an object" }, { status: 400 });
  }
  const { kind, id, action, notes } = body as {
    kind?: unknown;
    id?: unknown;
    action?: unknown;
    notes?: unknown;
  };
  if (typeof kind !== "string" || typeof id !== "string" || typeof action !== "string") {
    return Response.json(
      { error: "kind, id, and action are required strings" },
      { status: 400 },
    );
  }
  const notesValue = typeof notes === "string" && notes.length > 0 ? notes.slice(0, 2000) : null;

  if (kind === "flag") {
    if (!FLAG_ACTIONS.has(action)) {
      return Response.json(
        { error: `Unknown flag action: ${action}` },
        { status: 400 },
      );
    }
    return await handleFlagAction({
      flagId: id,
      action: action as FlagAction,
      notes: notesValue,
      adminId: session.user.id,
    });
  }
  if (kind === "listing") {
    if (!LISTING_ACTIONS.has(action)) {
      return Response.json(
        { error: `Unknown listing action: ${action}` },
        { status: 400 },
      );
    }
    return await handleListingAction({
      listingId: id,
      action: action as ListingAction,
      notes: notesValue,
      adminId: session.user.id,
    });
  }
  return Response.json({ error: "kind must be 'flag' or 'listing'" }, { status: 400 });
}

async function handleFlagAction(args: {
  flagId: string;
  action: FlagAction;
  notes: string | null;
  adminId: string;
}) {
  const flag = await prisma.flagReport.findUnique({ where: { id: args.flagId } });
  if (!flag) {
    return Response.json({ error: "Flag not found" }, { status: 404 });
  }

  const flagPatch: { status: FlagStatus; resolvedAt?: Date; resolvedBy?: string; adminNotes?: string } = {
    status: "OPEN" as FlagStatus,
  };
  let listingNewStatus: LinkVerificationStatus | null = null;

  switch (args.action) {
    case "in_review":
      flagPatch.status = "IN_REVIEW";
      break;
    case "dismiss":
      flagPatch.status = "DISMISSED";
      flagPatch.resolvedAt = new Date();
      flagPatch.resolvedBy = args.adminId;
      break;
    case "resolve_verified":
      flagPatch.status = "RESOLVED";
      flagPatch.resolvedAt = new Date();
      flagPatch.resolvedBy = args.adminId;
      listingNewStatus = "VERIFIED";
      break;
    case "resolve_source_dead":
      flagPatch.status = "RESOLVED";
      flagPatch.resolvedAt = new Date();
      flagPatch.resolvedBy = args.adminId;
      listingNewStatus = "SOURCE_DEAD";
      break;
    case "resolve_program_closed":
      flagPatch.status = "RESOLVED";
      flagPatch.resolvedAt = new Date();
      flagPatch.resolvedBy = args.adminId;
      listingNewStatus = "PROGRAM_CLOSED";
      break;
  }
  if (args.notes) flagPatch.adminNotes = args.notes;

  const shouldUpdateListing = listingNewStatus !== null && flag.type === "listing";
  let listingBefore: { id: string; linkVerificationStatus: LinkVerificationStatus; sourceUrl: string | null; applicationUrl: string | null; websiteUrl: string | null } | null = null;
  if (shouldUpdateListing) {
    listingBefore = await prisma.listing.findUnique({
      where: { id: flag.targetId },
      select: { id: true, linkVerificationStatus: true, sourceUrl: true, applicationUrl: true, websiteUrl: true },
    });
    if (!listingBefore) {
      return Response.json({ error: "Flag references a listing that no longer exists" }, { status: 404 });
    }
  }

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.flagReport.update({ where: { id: flag.id }, data: flagPatch }),
    prisma.adminActionLog.create({
      data: {
        adminId: args.adminId,
        action: `verification_queue.flag.${args.action}`,
        targetType: "flag_report",
        targetId: flag.id,
        notes: args.notes,
      },
    }),
  ];

  if (shouldUpdateListing && listingBefore && listingNewStatus) {
    const probedUrl =
      listingBefore.sourceUrl || listingBefore.applicationUrl || listingBefore.websiteUrl || null;
    const listingPatch = buildListingPatch(listingNewStatus);
    ops.push(
      prisma.listing.update({
        where: { id: listingBefore.id },
        data: listingPatch,
      }),
    );
    ops.push(
      prisma.dataVerification.create({
        data: {
          targetType: "listing",
          targetId: listingBefore.id,
          verifiedBy: `${VERIFIED_BY_ADMIN_PREFIX}${args.adminId}`,
          sourceType: "OFFICIAL",
          sourceUrl: probedUrl,
          method: "MANUAL",
          statusBefore: listingBefore.linkVerificationStatus,
          statusAfter: listingNewStatus,
          httpStatus: null,
          finalUrl: null,
          errorMessage: null,
          notes: args.notes,
        },
      }),
    );
    ops.push(
      prisma.adminActionLog.create({
        data: {
          adminId: args.adminId,
          action: `verification_queue.listing.${listingNewStatus.toLowerCase()}_via_flag`,
          targetType: "listing",
          targetId: listingBefore.id,
          notes: args.notes,
        },
      }),
    );
  }

  await prisma.$transaction(ops);
  return Response.json({ success: true });
}

async function handleListingAction(args: {
  listingId: string;
  action: ListingAction;
  notes: string | null;
  adminId: string;
}) {
  const listing = await prisma.listing.findUnique({
    where: { id: args.listingId },
    select: {
      id: true,
      linkVerificationStatus: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
    },
  });
  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const newStatus: LinkVerificationStatus = (() => {
    switch (args.action) {
      case "mark_verified":
        return "VERIFIED";
      case "mark_needs_review":
        return "NEEDS_MANUAL_REVIEW";
      case "mark_source_dead":
        return "SOURCE_DEAD";
      case "mark_program_closed":
        return "PROGRAM_CLOSED";
      case "mark_no_official_source":
        return "NO_OFFICIAL_SOURCE";
    }
  })();

  const probedUrl = listing.sourceUrl || listing.applicationUrl || listing.websiteUrl || null;
  const listingPatch = buildListingPatch(newStatus);

  await prisma.$transaction([
    prisma.listing.update({ where: { id: listing.id }, data: listingPatch }),
    prisma.dataVerification.create({
      data: {
        targetType: "listing",
        targetId: listing.id,
        verifiedBy: `${VERIFIED_BY_ADMIN_PREFIX}${args.adminId}`,
        sourceType: "OFFICIAL",
        sourceUrl: probedUrl,
        method: "MANUAL",
        statusBefore: listing.linkVerificationStatus,
        statusAfter: newStatus,
        httpStatus: null,
        finalUrl: null,
        errorMessage: null,
        notes: args.notes,
      },
    }),
    prisma.adminActionLog.create({
      data: {
        adminId: args.adminId,
        action: `verification_queue.listing.${args.action}`,
        targetType: "listing",
        targetId: listing.id,
        notes: args.notes,
      },
    }),
  ]);

  return Response.json({ success: true });
}

function buildListingPatch(newStatus: LinkVerificationStatus): {
  linkVerificationStatus: LinkVerificationStatus;
  linkVerified?: boolean;
  lastVerifiedAt?: Date;
  verificationFailureReason: string | null;
} {
  // `linkVerified` legacy Boolean rules:
  //   VERIFIED              → true (and advance lastVerifiedAt)
  //   NEEDS_MANUAL_REVIEW   → false (definitive failure observed)
  //   SOURCE_DEAD           → false (admin marked dead)
  //   PROGRAM_CLOSED        → false (admin marked closed)
  //   NO_OFFICIAL_SOURCE    → false (admin marked unsourced)
  //   REVERIFYING           → unchanged (transient holding state)
  //
  // `lastVerifiedAt` only advances on VERIFIED — never on a failure or
  // admin demotion.
  if (newStatus === "VERIFIED") {
    return {
      linkVerificationStatus: newStatus,
      linkVerified: true,
      lastVerifiedAt: new Date(),
      verificationFailureReason: null,
    };
  }
  if (
    newStatus === "NEEDS_MANUAL_REVIEW" ||
    newStatus === "SOURCE_DEAD" ||
    newStatus === "PROGRAM_CLOSED" ||
    newStatus === "NO_OFFICIAL_SOURCE"
  ) {
    return {
      linkVerificationStatus: newStatus,
      linkVerified: false,
      verificationFailureReason: null,
    };
  }
  // REVERIFYING fallthrough — admin can set this; legacy boolean unchanged.
  return {
    linkVerificationStatus: newStatus,
    verificationFailureReason: null,
  };
}
