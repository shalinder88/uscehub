import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCronSecret } from "@/lib/env";
import {
  classifyProbeOutcome,
  pickProbeUrl,
  type ProbeOutcome,
} from "@/lib/link-verification";
import type { LinkVerificationStatus } from "@prisma/client";

const TIMEOUT_MS = 10000;
const BATCH_SIZE = 5;
const BATCH_GAP_MS = 500;
const MAX_LISTINGS_PER_RUN = 25;
const USER_AGENT = "USCEHub-LinkVerifier/1.0 (uscehub.com; listing verification bot)";
const VERIFIED_BY_SENTINEL = "system:cron-verify-listings";

/**
 * Vercel Cron: verify Listing source/application/website URLs.
 *
 * Runs once daily (see `vercel.json` for the schedule). Walks a bounded
 * batch of APPROVED listings ordered by stalest `lastVerificationAttemptAt`
 * first (NULLS FIRST so never-verified rows lead). For each, picks the
 * most authoritative URL (sourceUrl > applicationUrl > websiteUrl), HEADs
 * it with a 10s timeout, and updates Phase 3.2 verification fields per
 * the classification table in
 * `docs/codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md`.
 *
 * Conservative-by-design (PR 3.3 contract):
 *   - Never sets SOURCE_DEAD. A single 404/410 routes to NEEDS_MANUAL_REVIEW.
 *   - Never modifies `Listing.status` (no auto-hide).
 *   - Never modifies the URL fields themselves.
 *   - `lastVerifiedAt` only advances when the new status is VERIFIED;
 *     failures leave it at its prior value (no manufactured timestamps).
 *
 * Auth identical to `/api/cron/verify-jobs`: requires `Bearer ${CRON_SECRET}`
 * in production; optional in development.
 */
export async function GET(request: Request) {
  const expectedSecret = getCronSecret();
  const authHeader = request.headers.get("authorization");

  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (expectedSecret) {
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // Dev with no CRON_SECRET configured: pass-through for local testing.

  const startedAt = new Date();

  const candidates = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      linkVerificationStatus: {
        notIn: ["NEEDS_MANUAL_REVIEW", "PROGRAM_CLOSED", "NO_OFFICIAL_SOURCE"],
      },
      OR: [
        { sourceUrl: { not: null } },
        { applicationUrl: { not: null } },
        { websiteUrl: { not: null } },
      ],
    },
    orderBy: [{ lastVerificationAttemptAt: { sort: "asc", nulls: "first" } }],
    take: MAX_LISTINGS_PER_RUN,
    select: {
      id: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
      linkVerificationStatus: true,
    },
  });

  const summary = {
    timestamp: startedAt.toISOString(),
    checked: 0,
    verified: 0,
    needs_manual_review: 0,
    reverifying: 0,
    skipped_no_url: 0,
    errors: 0,
    details: [] as Array<{
      id: string;
      url: string | null;
      before: LinkVerificationStatus;
      after: LinkVerificationStatus | "SKIPPED" | "ERROR";
      httpStatus: number | null;
    }>,
  };

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (listing) => {
        const url = pickProbeUrl({
          sourceUrl: listing.sourceUrl,
          applicationUrl: listing.applicationUrl,
          websiteUrl: listing.websiteUrl,
        });

        if (!url) {
          summary.skipped_no_url++;
          summary.details.push({
            id: listing.id,
            url: null,
            before: listing.linkVerificationStatus,
            after: "SKIPPED",
            httpStatus: null,
          });
          return;
        }

        const outcome = await probeUrl(url);
        const classification = classifyProbeOutcome(outcome);

        try {
          await applyClassification({
            listingId: listing.id,
            statusBefore: listing.linkVerificationStatus,
            classification,
            outcome,
            probedUrl: url,
          });

          summary.checked++;
          if (classification.status === "VERIFIED") summary.verified++;
          else if (classification.status === "NEEDS_MANUAL_REVIEW") summary.needs_manual_review++;
          else if (classification.status === "REVERIFYING") summary.reverifying++;

          summary.details.push({
            id: listing.id,
            url,
            before: listing.linkVerificationStatus,
            after: classification.status,
            httpStatus: outcome.httpStatus,
          });
        } catch {
          // Persistence failure for this row — don't fail the whole run.
          summary.errors++;
          summary.details.push({
            id: listing.id,
            url,
            before: listing.linkVerificationStatus,
            after: "ERROR",
            httpStatus: outcome.httpStatus,
          });
        }
      }),
    );

    if (i + BATCH_SIZE < candidates.length) {
      await new Promise((r) => setTimeout(r, BATCH_GAP_MS));
    }
  }

  return NextResponse.json(summary);
}

async function probeUrl(url: string): Promise<ProbeOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeout);
    return {
      httpStatus: res.status,
      redirected: res.redirected,
      finalUrl: res.redirected ? res.url : null,
      errorKind: "none",
    };
  } catch (e: unknown) {
    clearTimeout(timeout);
    const message = e instanceof Error ? e.message : String(e);
    if (message.toLowerCase().includes("abort")) {
      return { httpStatus: 408, redirected: false, finalUrl: null, errorKind: "timeout" };
    }
    return { httpStatus: 0, redirected: false, finalUrl: null, errorKind: "network" };
  }
}

interface ApplyArgs {
  listingId: string;
  statusBefore: LinkVerificationStatus;
  classification: { status: LinkVerificationStatus; reason: string | null };
  outcome: ProbeOutcome;
  probedUrl: string;
}

/**
 * Updates Listing verification fields and writes a DataVerification audit
 * row in a single transaction so the audit-trail is atomic with the
 * state change.
 */
async function applyClassification(args: ApplyArgs): Promise<void> {
  const now = new Date();
  const status = args.classification.status;

  // Legacy `linkVerified` Boolean rules (intentional split from the new
  // enum so a transient REVERIFYING does not flap the existing "Verified"
  // badge on/off across days):
  //   VERIFIED              → true  (and advance lastVerifiedAt)
  //   NEEDS_MANUAL_REVIEW   → false (definitive failure observed)
  //   REVERIFYING           → unchanged (transient holding state)
  let legacyPatch: { linkVerified?: boolean; lastVerifiedAt?: Date } = {};
  if (status === "VERIFIED") {
    legacyPatch = { linkVerified: true, lastVerifiedAt: now };
  } else if (status === "NEEDS_MANUAL_REVIEW") {
    legacyPatch = { linkVerified: false };
  }

  await prisma.$transaction([
    prisma.listing.update({
      where: { id: args.listingId },
      data: {
        linkVerificationStatus: status,
        lastVerificationAttemptAt: now,
        verificationFailureReason: args.classification.reason,
        ...legacyPatch,
      },
    }),
    prisma.dataVerification.create({
      data: {
        targetType: "listing",
        targetId: args.listingId,
        verifiedBy: VERIFIED_BY_SENTINEL,
        sourceType: "OFFICIAL",
        sourceUrl: args.probedUrl,
        method: "CRON",
        statusBefore: args.statusBefore,
        statusAfter: args.classification.status,
        httpStatus: args.outcome.httpStatus,
        finalUrl: args.outcome.finalUrl,
        errorMessage: args.classification.reason,
      },
    }),
  ]);
}
