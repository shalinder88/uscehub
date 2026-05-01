import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCronSecret } from "@/lib/env";
import {
  classifyProbeOutcome,
  pickProbeUrl,
  type ProbeOutcome,
} from "@/lib/link-verification";
import { partitionByHost } from "@/lib/host-throttle";
import type { LinkVerificationStatus } from "@prisma/client";

const TIMEOUT_MS = 10000;
const BATCH_SIZE = 5;
const BATCH_GAP_MS = 500;
const MAX_LISTINGS_PER_RUN = 25;
// P96-1: at most one probe per hostname per cron tick. Defers extras
// to the next run (the `lastVerificationAttemptAt asc nulls first`
// ordering picks them up naturally). Avoids slamming a single
// hospital site with multiple parallel HEADs when several listings
// share a host.
const MAX_PROBES_PER_HOST_PER_RUN = 1;
// P96-1: open one admin-review AdminMessage when a listing has had
// this many consecutive non-VERIFIED outcomes. Deduped on a recency
// window so the same listing can't generate noise day after day.
const AUTO_FLAG_FAILURE_THRESHOLD = 3;
const AUTO_FLAG_DEDUPE_WINDOW_DAYS = 14;
const AUTO_FLAG_CATEGORY = "cron_verification_failure";
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

  // P96-1: pull a slightly larger candidate pool than MAX_LISTINGS_PER_RUN
  // so the per-host throttle has somewhere to draw replacements from when
  // it defers a host's extras. Still bounded; we never run more than
  // MAX_LISTINGS_PER_RUN actual probes.
  const CANDIDATE_OVERSCAN = Math.max(MAX_LISTINGS_PER_RUN * 2, 50);

  const rawCandidates = await prisma.listing.findMany({
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
    take: CANDIDATE_OVERSCAN,
    select: {
      id: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
      linkVerificationStatus: true,
    },
  });

  // Pure per-host partition. Pass-through for rows with no parseable URL —
  // the existing skip-no-url logic below catches them.
  const throttle = partitionByHost(
    rawCandidates.map((r) => ({
      id: r.id,
      probeUrl: pickProbeUrl({
        sourceUrl: r.sourceUrl,
        applicationUrl: r.applicationUrl,
        websiteUrl: r.websiteUrl,
      }),
      _row: r,
    })),
    { maxPerHost: MAX_PROBES_PER_HOST_PER_RUN }
  );

  // Cap the to-probe list at MAX_LISTINGS_PER_RUN. Whatever the throttle
  // selected beyond the cap rolls into next run via the `asc nulls first`
  // ordering.
  const candidates = throttle.toProbe
    .slice(0, MAX_LISTINGS_PER_RUN)
    .map((c) => c._row);
  const overflowFromCap = throttle.toProbe
    .slice(MAX_LISTINGS_PER_RUN)
    .map((c) => ({ id: c.id, reason: "exceeds_per_run_cap" as const }));

  const summary = {
    timestamp: startedAt.toISOString(),
    checked: 0,
    verified: 0,
    needs_manual_review: 0,
    reverifying: 0,
    skipped_no_url: 0,
    errors: 0,
    deferred_host_throttled: throttle.deferred.length,
    deferred_run_cap: overflowFromCap.length,
    auto_flagged: 0,
    distinct_hosts_seen: throttle.hostnamesSeen.length,
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

          // P96-1: 3-failure auto-flag. Only after a definitive
          // NEEDS_MANUAL_REVIEW outcome (REVERIFYING is transient and
          // shouldn't escalate). Deduped within
          // AUTO_FLAG_DEDUPE_WINDOW_DAYS so we don't generate noise.
          if (classification.status === "NEEDS_MANUAL_REVIEW") {
            const created = await maybeAutoFlag(listing.id, classification.reason);
            if (created) summary.auto_flagged++;
          }

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
  // HEAD first; many servers reject HEAD with 405 even when the resource
  // is reachable on GET. PR 3.3a: on a HEAD-405 we retry once with GET
  // so the recorded ProbeOutcome reflects actual liveness rather than
  // method rejection. Any 405 that survives this fallback is a real
  // "server rejects both HEAD and GET" situation and is routed to the
  // admin queue by classifyProbeOutcome.
  const head = await fetchWithMethod(url, "HEAD");
  if (head.errorKind !== "none" || head.httpStatus !== 405) {
    return head;
  }
  return await fetchWithMethod(url, "GET");
}

async function fetchWithMethod(url: string, method: "HEAD" | "GET"): Promise<ProbeOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
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

/**
 * P96-1: open one admin-review AdminMessage when a listing has had
 * AUTO_FLAG_FAILURE_THRESHOLD consecutive non-VERIFIED outcomes,
 * deduped on AUTO_FLAG_DEDUPE_WINDOW_DAYS so we don't churn the queue.
 *
 * Uses AdminMessage (not FlagReport) because:
 *   - AdminMessage has a nullable `userId` and `userEmail` — no fake
 *     reporter required for system-generated rows.
 *   - The category column is a free string; new categories surface
 *     in `/admin/messages` automatically without schema work.
 *   - Dedupe is a simple recency window via `createdAt` + body marker.
 *
 * Conservative-by-design:
 *   - Reads the listing's recent DataVerification rows; only fires if
 *     the last N events are all non-VERIFIED.
 *   - Never auto-hides the listing.
 *   - Never auto-marks SOURCE_DEAD or PROGRAM_CLOSED.
 *   - Returns true if a new AdminMessage row was created, false otherwise.
 *
 * Failures inside this helper are swallowed: a failed flag should
 * never break the cron's main verification path.
 */
async function maybeAutoFlag(listingId: string, reason: string | null): Promise<boolean> {
  try {
    // Look at the most recent verification events for this listing.
    const recent = await prisma.dataVerification.findMany({
      where: { targetType: "listing", targetId: listingId },
      orderBy: { createdAt: "desc" },
      take: AUTO_FLAG_FAILURE_THRESHOLD,
      select: { statusAfter: true },
    });
    if (recent.length < AUTO_FLAG_FAILURE_THRESHOLD) return false;
    if (recent.some((r) => r.statusAfter === "VERIFIED")) return false;

    // Dedupe: skip if an open AdminMessage with our category mentions
    // this listing within the dedupe window.
    const since = new Date(Date.now() - AUTO_FLAG_DEDUPE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const existing = await prisma.adminMessage.findFirst({
      where: {
        category: AUTO_FLAG_CATEGORY,
        body: { contains: listingId },
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    if (existing) return false;

    await prisma.adminMessage.create({
      data: {
        userId: null,
        userEmail: null,
        userName: VERIFIED_BY_SENTINEL,
        category: AUTO_FLAG_CATEGORY,
        subject: `Verification cron flagged listing ${listingId}`,
        body: [
          `Listing ID: ${listingId}`,
          `Threshold: ${AUTO_FLAG_FAILURE_THRESHOLD} consecutive non-VERIFIED outcomes.`,
          `Most recent reason: ${reason ?? "(none)"}`,
          `Action: review the listing's source URL via /admin/verification-queue.`,
        ].join("\n"),
        status: "OPEN",
      },
    });
    return true;
  } catch {
    return false;
  }
}
