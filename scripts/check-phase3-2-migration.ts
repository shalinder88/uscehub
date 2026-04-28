/**
 * Read-only spot checks confirming the Phase 3.2 migration applied
 * cleanly to production. No writes, no UPDATEs.
 *
 * Run via:
 *   cd /Users/shelly/usmle-platform && npx tsx scripts/check-phase3-2-migration.ts
 *
 * This script is a one-off verification artifact for the Phase 3.2 deploy
 * gate; it reads the Prisma client to confirm new columns are present and
 * backfill rules landed correctly. Safe to delete after confirmation.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

let pass = 0;
let fail = 0;

function ok(label: string): void {
  pass++;
  console.log(`  ok    ${label}`);
}

function bad(label: string, detail?: unknown): void {
  fail++;
  console.log(`  FAIL  ${label}${detail !== undefined ? ` — ${String(detail)}` : ""}`);
}

async function main() {
  console.log("=== Phase 3.2 production verification ===\n");

  // ---- 1. New columns are queryable (no "column does not exist" errors)
  console.log("Schema additions reachable via Prisma client:");
  try {
    const sample = await prisma.listing.findFirst({
      select: {
        id: true,
        sourceUrl: true,
        applicationUrl: true,
        linkVerificationStatus: true,
        lastVerifiedAt: true,
        lastVerificationAttemptAt: true,
        verificationFailureReason: true,
        websiteUrl: true,
        linkVerified: true,
      },
    });
    if (sample) {
      ok("Listing.sourceUrl is selectable");
      ok("Listing.applicationUrl is selectable");
      ok("Listing.linkVerificationStatus is selectable");
      ok("Listing.lastVerifiedAt is selectable");
      ok("Listing.lastVerificationAttemptAt is selectable");
      ok("Listing.verificationFailureReason is selectable");
      ok("Listing.websiteUrl still exists (backward compat)");
      ok("Listing.linkVerified Boolean still exists (backward compat)");
    } else {
      bad("Listing.findFirst returned null — DB may be empty?");
    }
  } catch (e) {
    bad("Listing field SELECT failed", e);
  }

  // ---- 2. Backfill: linkVerified=true → linkVerificationStatus=VERIFIED
  console.log("\nBackfill rule: linkVerified=true ⇒ linkVerificationStatus=VERIFIED");
  try {
    const verifiedCount = await prisma.listing.count({ where: { linkVerified: true } });
    const verifiedStatusCount = await prisma.listing.count({
      where: { linkVerified: true, linkVerificationStatus: "VERIFIED" },
    });
    if (verifiedCount === verifiedStatusCount) {
      ok(`all ${verifiedCount} linkVerified=true rows have linkVerificationStatus=VERIFIED`);
    } else {
      bad(
        `only ${verifiedStatusCount}/${verifiedCount} linkVerified=true rows have VERIFIED status`,
      );
    }
  } catch (e) {
    bad("verified-rows backfill query failed", e);
  }

  // ---- 3. Backfill: linkVerified=false ⇒ linkVerificationStatus=UNKNOWN (default)
  console.log("\nBackfill rule: linkVerified=false ⇒ linkVerificationStatus=UNKNOWN");
  try {
    const unverifiedCount = await prisma.listing.count({ where: { linkVerified: false } });
    const unknownStatusCount = await prisma.listing.count({
      where: { linkVerified: false, linkVerificationStatus: "UNKNOWN" },
    });
    if (unverifiedCount === unknownStatusCount) {
      ok(`all ${unverifiedCount} linkVerified=false rows have linkVerificationStatus=UNKNOWN`);
    } else {
      bad(
        `only ${unknownStatusCount}/${unverifiedCount} linkVerified=false rows have UNKNOWN status`,
      );
    }
  } catch (e) {
    bad("unverified-rows backfill query failed", e);
  }

  // ---- 4. Backfill: sourceUrl populated from websiteUrl
  console.log("\nBackfill rule: sourceUrl populated from websiteUrl where websiteUrl IS NOT NULL");
  try {
    const withWebsiteUrl = await prisma.listing.count({ where: { websiteUrl: { not: null } } });
    const withSourceUrl = await prisma.listing.count({
      where: { websiteUrl: { not: null }, sourceUrl: { not: null } },
    });
    if (withWebsiteUrl === withSourceUrl) {
      ok(`all ${withWebsiteUrl} rows with websiteUrl have sourceUrl populated`);
    } else {
      bad(`only ${withSourceUrl}/${withWebsiteUrl} rows with websiteUrl got sourceUrl backfilled`);
    }
  } catch (e) {
    bad("sourceUrl backfill query failed", e);
  }

  // ---- 5. Backfill: applicationUrl populated from websiteUrl
  console.log("\nBackfill rule: applicationUrl populated from websiteUrl where websiteUrl IS NOT NULL");
  try {
    const withWebsiteUrl = await prisma.listing.count({ where: { websiteUrl: { not: null } } });
    const withApplicationUrl = await prisma.listing.count({
      where: { websiteUrl: { not: null }, applicationUrl: { not: null } },
    });
    if (withWebsiteUrl === withApplicationUrl) {
      ok(`all ${withWebsiteUrl} rows with websiteUrl have applicationUrl populated`);
    } else {
      bad(
        `only ${withApplicationUrl}/${withWebsiteUrl} rows with websiteUrl got applicationUrl backfilled`,
      );
    }
  } catch (e) {
    bad("applicationUrl backfill query failed", e);
  }

  // ---- 6. Honesty rule: lastVerifiedAt remains NULL across the board
  console.log("\nHonesty rule: lastVerifiedAt MUST be NULL on every listing (never invented)");
  try {
    const withFakeDate = await prisma.listing.count({
      where: { lastVerifiedAt: { not: null } },
    });
    if (withFakeDate === 0) {
      ok("zero listings have lastVerifiedAt populated (honest absence preserved)");
    } else {
      bad(`${withFakeDate} listings have lastVerifiedAt populated — backfill leaked a fake date!`);
    }
  } catch (e) {
    bad("lastVerifiedAt query failed", e);
  }

  // ---- 7. Honesty rule: lastVerificationAttemptAt remains NULL
  console.log("\nHonesty rule: lastVerificationAttemptAt MUST be NULL (set only by PR 3.3 cron)");
  try {
    const withAttempt = await prisma.listing.count({
      where: { lastVerificationAttemptAt: { not: null } },
    });
    if (withAttempt === 0) {
      ok("zero listings have lastVerificationAttemptAt populated");
    } else {
      bad(`${withAttempt} listings have lastVerificationAttemptAt populated`);
    }
  } catch (e) {
    bad("lastVerificationAttemptAt query failed", e);
  }

  // ---- 8. Honesty rule: no listing was set to REVERIFYING in initial backfill
  console.log("\nHonesty rule: zero listings should be REVERIFYING (reserved for PR 3.3 cron)");
  try {
    const reverifyingCount = await prisma.listing.count({
      where: { linkVerificationStatus: "REVERIFYING" },
    });
    if (reverifyingCount === 0) {
      ok("zero listings in REVERIFYING state");
    } else {
      bad(`${reverifyingCount} listings are REVERIFYING — should be 0`);
    }
  } catch (e) {
    bad("REVERIFYING query failed", e);
  }

  // ---- 9. FlagReport.kind exists with default OTHER
  console.log("\nFlagReport.kind column reachable");
  try {
    const flagSample = await prisma.flagReport.findFirst({
      select: { id: true, kind: true, sourceUrl: true, resolvedAt: true, resolvedBy: true },
    });
    ok("FlagReport.kind is selectable");
    ok("FlagReport.sourceUrl is selectable");
    ok("FlagReport.resolvedAt is selectable");
    ok("FlagReport.resolvedBy is selectable");
    if (flagSample) {
      // Existing flag reports get default OTHER per migration
      console.log(`    (sample flag #${flagSample.id} kind = ${flagSample.kind})`);
    }
  } catch (e) {
    bad("FlagReport SELECT failed", e);
  }

  // ---- 10. DataVerification extensions reachable
  console.log("\nDataVerification new columns reachable");
  try {
    const dvSample = await prisma.dataVerification.findFirst({
      select: {
        id: true,
        method: true,
        statusBefore: true,
        statusAfter: true,
        httpStatus: true,
        finalUrl: true,
        errorMessage: true,
      },
    });
    ok("DataVerification.method is selectable");
    ok("DataVerification.statusBefore is selectable");
    ok("DataVerification.statusAfter is selectable");
    ok("DataVerification.httpStatus is selectable");
    ok("DataVerification.finalUrl is selectable");
    ok("DataVerification.errorMessage is selectable");
    if (dvSample) {
      console.log(`    (sample DV #${dvSample.id})`);
    } else {
      console.log("    (no DataVerification rows yet — expected; PR 3.3 cron will populate)");
    }
  } catch (e) {
    bad("DataVerification SELECT failed", e);
  }

  // ---- Summary
  console.log("");
  console.log(`Total: ${pass} pass, ${fail} fail`);
  await prisma.$disconnect();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error("Script failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
