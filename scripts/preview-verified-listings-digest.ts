/**
 * Read-only preview of the verified-listings digest (Phase 3.6 foundation).
 *
 * This script does NOT send anything. It does NOT persist anything.
 * It does NOT touch subscribers (none exist yet). It is purely a
 * preview of what a future weekly verified-listings digest could
 * contain, computed from the existing verification fields shipped in
 * Phase 3 (linkVerificationStatus + lastVerifiedAt).
 *
 * Usage:
 *   cd /Users/shelly/usmle-platform && \
 *     npx tsx scripts/preview-verified-listings-digest.ts
 *
 *   # custom window:
 *   cd /Users/shelly/usmle-platform && \
 *     WINDOW_DAYS=3 npx tsx scripts/preview-verified-listings-digest.ts
 *
 *   # custom render cap:
 *   cd /Users/shelly/usmle-platform && \
 *     MAX_ITEMS=10 npx tsx scripts/preview-verified-listings-digest.ts
 *
 * Eligibility: same predicate as `isDigestEligible()` in
 * src/lib/verified-digest.ts. A listing is eligible iff:
 *   - linkVerificationStatus === VERIFIED  (not "verified-on-file")
 *   - lastVerifiedAt is non-null            (real timestamp)
 *   - status === APPROVED                   (not pending/rejected/hidden)
 *   - lastVerifiedAt within WINDOW_DAYS     (default 7)
 *
 * Read-only doctrine:
 *   - Uses prisma.listing.findMany only. No create/update/delete/upsert.
 *   - No network requests except the Prisma read.
 *   - No secrets read or printed. No CRON_SECRET. No Resend API key.
 *   - Resend client (src/lib/email.ts) is intentionally NOT imported
 *     here so there is zero chance of an accidental send.
 *
 * Exit codes:
 *   0  always (preview-only; nothing to fail).
 *
 * When this becomes a real send-path:
 *   - A subscriber model + consent + unsubscribe flow must land first
 *     (see future docs/codebase-audit/PHASE_3_6_CONVERSION_FOUNDATION_PLAN.md).
 *   - The cron must have run cleanly for ~3-7 days.
 *   - The subject line and body of `formatDigestPlain()` must be
 *     reviewed for honest trust language (no overclaiming
 *     "we verified these for you" — they were probed, not endorsed).
 */

import { PrismaClient } from "@prisma/client";
import {
  formatDigestPlain,
  pickListingUrl,
  type DigestEligibleListing,
} from "../src/lib/verified-digest";

const prisma = new PrismaClient();

function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) {
    console.error(`[warn] ${name}=${raw} is not a positive integer; falling back to ${fallback}`);
    return fallback;
  }
  return n;
}

async function main(): Promise<number> {
  const windowDays = readPositiveIntEnv("WINDOW_DAYS", 7);
  const maxItems = readPositiveIntEnv("MAX_ITEMS", 25);
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  // The Prisma `where` mirrors `isDigestEligible()` from the helper.
  // Kept colocated so any future predicate change happens in both
  // places at once.
  const rows = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      linkVerificationStatus: "VERIFIED",
      lastVerifiedAt: {
        not: null,
        gte: cutoff,
      },
    },
    orderBy: { lastVerifiedAt: "desc" },
    select: {
      id: true,
      title: true,
      listingType: true,
      specialty: true,
      city: true,
      state: true,
      duration: true,
      cost: true,
      sourceUrl: true,
      applicationUrl: true,
      websiteUrl: true,
      lastVerifiedAt: true,
    },
  });

  const eligible: DigestEligibleListing[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    listingType: r.listingType,
    specialty: r.specialty,
    city: r.city,
    state: r.state,
    duration: r.duration ?? null,
    cost: r.cost ?? null,
    sourceUrl: r.sourceUrl ?? null,
    applicationUrl: r.applicationUrl ?? null,
    websiteUrl: r.websiteUrl ?? null,
    lastVerifiedAt: r.lastVerifiedAt as Date,
    preferredUrl: pickListingUrl({
      sourceUrl: r.sourceUrl ?? null,
      applicationUrl: r.applicationUrl ?? null,
      websiteUrl: r.websiteUrl ?? null,
    }),
  }));

  const preview = formatDigestPlain(eligible, { windowDays, maxItems });
  process.stdout.write(preview.plainText);
  return 0;
}

main()
  .then((code) => {
    return prisma.$disconnect().then(() => process.exit(code));
  })
  .catch((e) => {
    console.error("preview-verified-listings-digest error:", e instanceof Error ? e.message : String(e));
    void prisma.$disconnect().finally(() => process.exit(1));
  });
