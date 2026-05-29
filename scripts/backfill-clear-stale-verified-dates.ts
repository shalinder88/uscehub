/**
 * One-time integrity backfill: clear stale `lastVerifiedAt` dates.
 *
 * Before the cron (applyClassification) and admin queue (buildListingPatch)
 * were hardened, a listing demoted out of VERIFIED kept its old
 * `lastVerifiedAt`. That retained "verified N days ago" date is a
 * fake-freshness signal: it skews /recommend's verified-first ordering and
 * the /admin/freshness "verified in last 30 days" counts, even though the
 * public "Verified" badge (driven by the `linkVerified` Boolean) already
 * reads false. This script clears the date on every row whose current
 * status is a definitive non-verified state.
 *
 * REVERIFYING is deliberately excluded — it is a transient hold that keeps
 * its prior date so a one-off timeout/5xx doesn't wipe a genuine
 * verification.
 *
 * Read-only by default. Pass --apply to write. Full per-row before-state is
 * printed either way; the Supabase pre-audit snapshot is the rollback path.
 */
import { PrismaClient, type LinkVerificationStatus } from "@prisma/client";

const prisma = new PrismaClient();

const STALE_STATUSES = [
  "NEEDS_MANUAL_REVIEW",
  "SOURCE_DEAD",
  "PROGRAM_CLOSED",
  "NO_OFFICIAL_SOURCE",
  "UNKNOWN",
] as const;

async function main() {
  const apply = process.argv.includes("--apply");

  const rows = await prisma.listing.findMany({
    where: {
      AND: [
        { lastVerifiedAt: { not: null } },
        { linkVerificationStatus: { in: STALE_STATUSES as unknown as LinkVerificationStatus[] } },
      ],
    },
    select: {
      id: true,
      title: true,
      linkVerificationStatus: true,
      linkVerified: true,
      lastVerifiedAt: true,
    },
    orderBy: { linkVerificationStatus: "asc" },
  });

  console.log(`mode: ${apply ? "APPLY (will write)" : "DRY-RUN (read-only)"}`);
  console.log(`rows with stale lastVerifiedAt: ${rows.length}`);
  console.log("");

  let badgeLeak = 0;
  for (const r of rows) {
    if (r.linkVerified) badgeLeak++;
    const date = r.lastVerifiedAt ? r.lastVerifiedAt.toISOString() : "(null)";
    const badge = r.linkVerified ? "  ⚠ linkVerified=TRUE (public badge leak)" : "";
    console.log(`  ${r.linkVerificationStatus.padEnd(20)} ${date}  ${r.id}  ${r.title}${badge}`);
  }

  console.log("");
  if (badgeLeak > 0) {
    console.log(
      `WARNING: ${badgeLeak} row(s) also have linkVerified=true while in a non-verified status — ` +
        `a stale verified badge is publicly visible. --apply clears the date only; ` +
        `the boolean needs a separate decision.`,
    );
  } else {
    console.log("OK: every stale-date row already has linkVerified=false (no public badge leak).");
  }

  if (!apply) {
    console.log("");
    console.log("dry-run only — no writes. Re-run with --apply to clear these dates.");
    return;
  }

  const ids = rows.map((r) => r.id);
  const result = await prisma.listing.updateMany({
    where: { id: { in: ids } },
    data: { lastVerifiedAt: null },
  });
  console.log("");
  console.log(`APPLIED: cleared lastVerifiedAt on ${result.count} row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
