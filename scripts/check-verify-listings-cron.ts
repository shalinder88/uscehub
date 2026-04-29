/**
 * Read-only health check for the verify-listings cron (Phase 3.3 / 3.3a).
 *
 * Run:
 *   cd /Users/shelly/usmle-platform && npx tsx scripts/check-verify-listings-cron.ts
 *
 * What it does:
 *   - Counts DataVerification rows attributable to the cron sentinel
 *     `verifiedBy = "system:cron-verify-listings"`.
 *   - Surfaces the latest 10 audit rows.
 *   - Reports Listing.linkVerificationStatus and Listing.status
 *     distributions.
 *   - Runs discipline checks against the conservative cron contract
 *     (PHASE_3_3_VERIFICATION_CRON_DESIGN.md + PHASE3 plan §4):
 *       * SOURCE_DEAD / PROGRAM_CLOSED / NO_OFFICIAL_SOURCE must be 0
 *         from cron-driven attribution. Rows in those statuses must
 *         only have come from admin actions (verifiedBy starting with
 *         `admin:`), never from the cron sentinel.
 *       * `lastVerifiedAt` must be null whenever
 *         `linkVerificationStatus !== VERIFIED` ("no fake dates" rule).
 *   - Writes a clear PASS / WARN / FAIL summary.
 *
 * What it does NOT do:
 *   - Never writes (no .create, .update, .delete, .upsert, .updateMany,
 *     .deleteMany, $executeRaw, $executeRawUnsafe).
 *   - Never reads or prints any secret. CRON_SECRET is not used.
 *   - Never makes network requests.
 *   - Never modifies the schema.
 *   - Never changes ordering, hides listings, or rewrites URLs.
 *
 * Exit codes:
 *   0 — PASS or WARN (still healthy enough to leave alone).
 *   1 — FAIL: a discipline violation was detected. Investigate before
 *       running another cron tick.
 *
 * Requires:
 *   - DATABASE_URL in environment (loaded via `node --env-file=.env`,
 *     or `npx tsx`'s automatic dotenv handling, or however you run it
 *     against a live DB).
 *
 * Companion: docs/codebase-audit/CRON_HEALTH_CHECK_RUNBOOK.md.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CRON_VERIFIED_BY = "system:cron-verify-listings";
const ADMIN_PREFIX = "admin:";

interface DangerousRow {
  id: string;
  targetId: string;
  verifiedBy: string;
  method: string | null;
  statusAfter: string | null;
  createdAt: Date;
}

interface Outcome {
  level: "PASS" | "WARN" | "FAIL";
  message: string;
}

async function main(): Promise<number> {
  const outcomes: Outcome[] = [];

  console.log("=== verify-listings cron health check ===");
  console.log("Run at:", new Date().toISOString());
  console.log("");

  // ── 1. cron audit row counts ─────────────────────────────────────
  const cronTotal = await prisma.dataVerification.count({
    where: {
      targetType: "listing",
      verifiedBy: CRON_VERIFIED_BY,
      method: "CRON",
    },
  });
  console.log("1. DataVerification rows from cron sentinel:");
  console.log(`     total: ${cronTotal}`);

  // 2. last 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const cronLast24h = await prisma.dataVerification.count({
    where: {
      targetType: "listing",
      verifiedBy: CRON_VERIFIED_BY,
      method: "CRON",
      createdAt: { gte: since24h },
    },
  });
  console.log(`     last 24h: ${cronLast24h}`);
  if (cronTotal === 0) {
    outcomes.push({
      level: "WARN",
      message:
        "No cron audit rows yet. Either the scheduled tick hasn't fired or the route is unauthenticated.",
    });
  }

  // ── 3. latest 10 audit rows ──────────────────────────────────────
  console.log("");
  console.log("3. Latest 10 cron audit rows:");
  const recent = await prisma.dataVerification.findMany({
    where: {
      targetType: "listing",
      verifiedBy: CRON_VERIFIED_BY,
      method: "CRON",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      targetId: true,
      statusBefore: true,
      statusAfter: true,
      httpStatus: true,
      finalUrl: true,
      errorMessage: true,
      createdAt: true,
    },
  });
  for (const r of recent) {
    console.log(
      `   ${r.createdAt.toISOString()} ${r.targetId} ${r.statusBefore ?? "?"} → ${r.statusAfter ?? "?"} http=${r.httpStatus ?? "-"}${r.errorMessage ? ` reason=${r.errorMessage}` : ""}`,
    );
  }

  // ── 4. Listing.linkVerificationStatus distribution ───────────────
  console.log("");
  console.log("4. Listing.linkVerificationStatus distribution:");
  const enumDist = await prisma.listing.groupBy({
    by: ["linkVerificationStatus"],
    _count: { _all: true },
  });
  for (const row of enumDist) {
    console.log(`   ${String(row.linkVerificationStatus).padEnd(20)} ${row._count._all}`);
  }

  // ── 5. Listing.status distribution ───────────────────────────────
  console.log("");
  console.log("5. Listing.status distribution:");
  const statusDist = await prisma.listing.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  for (const row of statusDist) {
    console.log(`   ${String(row.status).padEnd(20)} ${row._count._all}`);
  }

  // ── 6. dangerous-status checks (cron-attribution) ────────────────
  // The cron contract forbids the cron from setting SOURCE_DEAD,
  // PROGRAM_CLOSED, or NO_OFFICIAL_SOURCE. If any DataVerification row
  // attributed to the cron sentinel claims one of those `statusAfter`
  // values, the contract was violated.
  console.log("");
  console.log("6. Cron-attributed dangerous transitions (must be 0):");
  const cronForbiddenStatuses = ["SOURCE_DEAD", "PROGRAM_CLOSED", "NO_OFFICIAL_SOURCE"] as const;
  for (const forbidden of cronForbiddenStatuses) {
    const count = await prisma.dataVerification.count({
      where: {
        targetType: "listing",
        verifiedBy: CRON_VERIFIED_BY,
        statusAfter: forbidden,
      },
    });
    console.log(`   cron-attributed ${forbidden}: ${count}`);
    if (count > 0) {
      const rows = (await prisma.dataVerification.findMany({
        where: {
          targetType: "listing",
          verifiedBy: CRON_VERIFIED_BY,
          statusAfter: forbidden,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          targetId: true,
          verifiedBy: true,
          method: true,
          statusAfter: true,
          createdAt: true,
        },
      })) as DangerousRow[];
      for (const r of rows) {
        console.log(`     id=${r.id} target=${r.targetId} at=${r.createdAt.toISOString()}`);
      }
      outcomes.push({
        level: "FAIL",
        message: `Cron sentinel produced ${count} ${forbidden} row(s). The cron must never set this status. Investigate src/lib/link-verification.ts and src/app/api/cron/verify-listings/route.ts.`,
      });
    }
  }

  // For visibility, also report ADMIN-attributed counts in those
  // statuses — those are allowed (PR #12 admin queue), just informational.
  console.log("");
  console.log("   admin-attributed counts (allowed; informational):");
  for (const status of cronForbiddenStatuses) {
    const adminCount = await prisma.dataVerification.count({
      where: {
        targetType: "listing",
        verifiedBy: { startsWith: ADMIN_PREFIX },
        statusAfter: status,
      },
    });
    console.log(`   admin ${status}: ${adminCount}`);
  }

  // ── 7. lastVerifiedAt discipline ─────────────────────────────────
  console.log("");
  console.log("7. lastVerifiedAt discipline:");
  const fakeVerifiedAt = await prisma.listing.count({
    where: {
      AND: [
        { lastVerifiedAt: { not: null } },
        { linkVerificationStatus: { not: "VERIFIED" } },
      ],
    },
  });
  console.log(`   Listings with lastVerifiedAt set but linkVerificationStatus != VERIFIED: ${fakeVerifiedAt}`);
  if (fakeVerifiedAt > 0) {
    outcomes.push({
      level: "FAIL",
      message: `${fakeVerifiedAt} listing(s) have a non-null lastVerifiedAt but their current linkVerificationStatus is not VERIFIED. The "no fake dates" rule (RULES.md / PHASE3 plan §4) is violated. lastVerifiedAt must only advance on VERIFIED.`,
    });
  }

  // ── 8. lastVerificationAttemptAt counts ──────────────────────────
  console.log("");
  console.log("8. Verification timestamps:");
  const totalListings = await prisma.listing.count();
  const withVerifiedAt = await prisma.listing.count({
    where: { lastVerifiedAt: { not: null } },
  });
  const withAttemptAt = await prisma.listing.count({
    where: { lastVerificationAttemptAt: { not: null } },
  });
  console.log(`   total listings:                  ${totalListings}`);
  console.log(`   with lastVerifiedAt set:         ${withVerifiedAt}`);
  console.log(`   with lastVerificationAttemptAt:  ${withAttemptAt}`);

  // ── 9. PASS / WARN / FAIL summary ────────────────────────────────
  console.log("");
  console.log("=== summary ===");
  const fails = outcomes.filter((o) => o.level === "FAIL");
  const warns = outcomes.filter((o) => o.level === "WARN");
  if (fails.length > 0) {
    console.log("FAIL");
    for (const o of fails) console.log(`   FAIL: ${o.message}`);
    for (const o of warns) console.log(`   WARN: ${o.message}`);
    return 1;
  }
  if (warns.length > 0) {
    console.log("WARN");
    for (const o of warns) console.log(`   WARN: ${o.message}`);
    return 0;
  }
  console.log("PASS — cron contract appears intact.");
  return 0;
}

main()
  .then((code) => {
    return prisma.$disconnect().then(() => process.exit(code));
  })
  .catch((e) => {
    console.error("check-verify-listings-cron error:", e instanceof Error ? e.message : String(e));
    void prisma.$disconnect().finally(() => process.exit(1));
  });
