/**
 * Second enrichment pass — surface auditData.signals_detected into
 * structured listing columns. Conservative rules, 1-by-1.
 *
 * Rules (each a separate decision; never combined):
 *
 *   R1 visaSupport
 *     - source: auditData.signals_detected.visa_mentions (array of strings)
 *     - apply when: array non-empty AND current visaSupport === false
 *     - action: set visaSupport = true
 *     - rationale: explicit visa mentions on the program page are evidence
 *       the program addresses visa logistics — strictly more informative
 *       than the default `false`. Never flip true → false.
 *
 *   R2 applicationMethod
 *     - source: auditData.signals_detected.application_platform (string)
 *     - allowlist of platforms we trust to migrate:
 *         "VSLO", "VSAS", "AAMC"
 *     - apply when: signal is in allowlist AND current applicationMethod is
 *       the generic placeholder "external" (or null/empty)
 *     - action: set applicationMethod = signal value (preserving case)
 *     - rationale: "external" tells the user nothing; "VSLO" tells them the
 *       exact platform. ERAS is excluded because it's the residency match
 *       platform — its mention in observership audit excerpts is a
 *       false positive (page discusses post-USCE residency goals).
 *
 * NOT applied (deliberately skipped):
 *
 *   - duration: column values are typically hand-authored and richer than
 *     the duration_mention tokens (e.g. "Maximum 4 weeks (one rotation only)"
 *     vs ["4- week"]).
 *
 *   - cost: signals_detected.fee_mentions catches every dollar amount on
 *     the page including unrelated ones ($1, $3, contact numbers, etc.).
 *     Risk of degrading hand-curated values > opportunity.
 *
 *   - contactEmail: already handled by the first enrichment pass (P50c).
 *
 * No regex (per user instruction, non-negotiable). All comparisons are
 * literal string operations. No batching — one listing processed, decided,
 * and updated at a time. Each change appended to adminNotes.
 *
 * Mode: APPLY when run with `--apply`, otherwise DRY_RUN preview.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SignalsDetected = {
  fee_mentions: unknown;
  contact_email: unknown;
  visa_mentions: unknown;
  duration_mentions: unknown;
  application_platform: unknown;
};

type AuditData = {
  signals_detected?: SignalsDetected;
};

type AuditListingRow = {
  id: string;
  title: string;
  visaSupport: boolean | null;
  applicationMethod: string | null;
  adminNotes: string | null;
  auditData: AuditData | null;
};

const PLATFORM_ALLOWLIST = ["VSLO", "VSAS", "AAMC"];

function isStringArrayNonEmpty(v: unknown): v is string[] {
  if (!Array.isArray(v)) return false;
  if (v.length === 0) return false;
  for (let i = 0; i < v.length; i++) {
    if (typeof v[i] !== "string") return false;
    if (v[i].length === 0) return false;
  }
  return true;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length > 0;
}

function platformInAllowlist(signal: string): boolean {
  for (let i = 0; i < PLATFORM_ALLOWLIST.length; i++) {
    if (PLATFORM_ALLOWLIST[i] === signal) return true;
  }
  return false;
}

function colIsGenericExternal(col: string | null): boolean {
  if (col === null) return true;
  if (col === "") return true;
  if (col === "external") return true;
  return false;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.indexOf("--apply") >= 0;
  const mode = apply ? "APPLY" : "DRY_RUN";
  const ranAt = new Date().toISOString();

  console.log("[2nd-pass] mode:", mode, "ran_at:", ranAt);

  const rows = (await prisma.$queryRaw`
    SELECT id, title, "visaSupport", "applicationMethod", "adminNotes", "auditData"
    FROM listings
    WHERE status = 'APPROVED' AND "auditData" IS NOT NULL
    ORDER BY title ASC
  `) as AuditListingRow[];

  console.log("[2nd-pass] candidate listings:", rows.length);

  let visaFlipped = 0;
  let platformReplaced = 0;
  let listingsUpdated = 0;
  const changes: Array<{
    id: string;
    title: string;
    visa?: { from: boolean | null; to: boolean; mentions: string[] };
    platform?: { from: string | null; to: string };
  }> = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const sig = (r.auditData && r.auditData.signals_detected) || null;
    if (!sig) continue;

    let listingChanged = false;
    const change: {
      id: string;
      title: string;
      visa?: { from: boolean | null; to: boolean; mentions: string[] };
      platform?: { from: string | null; to: string };
    } = { id: r.id, title: r.title };

    // R1 visa
    let nextVisa: boolean | null = r.visaSupport;
    if (
      isStringArrayNonEmpty(sig.visa_mentions) &&
      r.visaSupport === false
    ) {
      nextVisa = true;
      change.visa = {
        from: r.visaSupport,
        to: true,
        mentions: sig.visa_mentions.slice(),
      };
      visaFlipped++;
      listingChanged = true;
    }

    // R2 applicationMethod
    let nextPlatform: string | null = r.applicationMethod;
    if (
      isNonEmptyString(sig.application_platform) &&
      platformInAllowlist(sig.application_platform) &&
      colIsGenericExternal(r.applicationMethod)
    ) {
      nextPlatform = sig.application_platform;
      change.platform = {
        from: r.applicationMethod,
        to: sig.application_platform,
      };
      platformReplaced++;
      listingChanged = true;
    }

    if (!listingChanged) continue;
    changes.push(change);
    listingsUpdated++;

    if (!apply) continue;

    // Build the adminNotes appendix one decision per line
    const noteLines: string[] = [];
    noteLines.push(`Signals-2nd-pass enrich ${ranAt.slice(0, 10)}:`);
    if (change.visa) {
      noteLines.push(
        `  - visaSupport: ${String(change.visa.from)} → true (auditData.signals_detected.visa_mentions: ${change.visa.mentions.join(", ")})`,
      );
    }
    if (change.platform) {
      noteLines.push(
        `  - applicationMethod: "${String(change.platform.from)}" → "${change.platform.to}" (auditData.signals_detected.application_platform)`,
      );
    }
    const newNoteBlock = noteLines.join("\n");
    const newAdminNotes = r.adminNotes
      ? r.adminNotes + "\n\n" + newNoteBlock
      : newNoteBlock;

    await prisma.$executeRaw`
      UPDATE listings
      SET "visaSupport" = ${nextVisa},
          "applicationMethod" = ${nextPlatform},
          "adminNotes" = ${newAdminNotes},
          "updatedAt" = NOW()
      WHERE id = ${r.id}
    `;
  }

  console.log("");
  console.log("[2nd-pass] summary:");
  console.log("  listings_updated:", listingsUpdated);
  console.log("  visa_flipped:    ", visaFlipped);
  console.log("  platform_replaced:", platformReplaced);
  console.log("");
  console.log("[2nd-pass] sample of changes (first 10):");
  for (let i = 0; i < Math.min(10, changes.length); i++) {
    console.log("  -", JSON.stringify(changes[i]));
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("[2nd-pass] FATAL", err);
  await prisma.$disconnect();
  process.exit(1);
});
