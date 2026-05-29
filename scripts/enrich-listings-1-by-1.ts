/**
 * Per-program data enrichment, processed 1-by-1.
 *
 * Reads sources LIVE — no intermediate JSON files needed:
 *   1. scripts/data/*.ts seed records (April 17 hand-research, 97 records)
 *   2. Supabase Listing rows (incl. auditData JSON column)
 *
 * For each APPROVED listing with gaps:
 *   - print "[i/N] db_id | title"
 *   - print each proposed change (field, from, to, source)
 *   - apply single Prisma update for that listing
 *   - append adminNote with the field-by-field change record
 *
 * Rules:
 *   - FILL (empty → value): always applied (no risk of overwriting curated text)
 *   - ENRICH (thin → richer): only if source is >= 1.5x longer AND >= 100 chars
 *   - SKIP otherwise
 *   - NO regex anywhere (literal-string scans only)
 *   - NO batching — one Prisma update per listing
 *
 * --apply executes. Default is dry-run.
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ── Seed parser (no regex) ──────────────────────────────────────────────────
function findField(text: string, anchor: string, startIdx: number): { value: string; endIdx: number } | null {
  const a = text.indexOf(anchor, startIdx);
  if (a === -1) return null;
  const valueStart = a + anchor.length;
  let i = valueStart;
  while (i < text.length) {
    if (text[i] === "\\") { i += 2; continue; }
    if (text[i] === '"') return { value: text.slice(valueStart, i), endIdx: i + 1 };
    i++;
  }
  return null;
}

const SEED_FIELDS = [
  "title", "listingType", "specialty", "city", "state", "format",
  "cost", "duration", "websiteUrl", "contactEmail",
  "shortDescription", "fullDescription", "eligibilitySummary",
  "ecfmgRequired", "stepRequirements", "graduationYearPref",
  "audienceTag", "usmleTier", "adminNotes",
];

function parseSeedFile(filePath: string): Record<string, string>[] {
  const text = fs.readFileSync(filePath, "utf8");
  const records: Record<string, string>[] = [];
  let cursor = 0;
  while (true) {
    const title = findField(text, 'title: "', cursor);
    if (!title) break;
    const rec: Record<string, string> = { title: title.value };
    // For each subsequent field, search WITHIN the next ~5000 chars of this record
    const recordWindowEnd = Math.min(text.length, title.endIdx + 8000);
    const recordSlice = text.slice(cursor, recordWindowEnd);
    for (const f of SEED_FIELDS.filter((x) => x !== "title")) {
      // Search in window only — prevents bleed into next record
      const v = findField(recordSlice, `${f}: "`, 0);
      if (v) rec[f] = v.value;
    }
    records.push(rec);
    cursor = title.endIdx + 50; // advance past title to start looking for next
    // Find next record start (next `title: "`)
    const nextTitle = text.indexOf('title: "', cursor);
    if (nextTitle === -1) break;
    cursor = nextTitle;
  }
  return records;
}

const SEED_FILES = [
  "scripts/data/observerships-2026-b1.ts",
  "scripts/data/observerships-2026-b2.ts",
  "scripts/data/observerships-2026-b3.ts",
  "scripts/data/observerships-2026-b4.ts",
  "scripts/data/clerkships-2026-a.ts",
  "scripts/data/clerkships-2026-b.ts",
];

// Field-level enrichment rules
type EnrichField = "shortDescription" | "fullDescription" | "eligibilitySummary" | "duration" | "cost" | "contactEmail" | "ecfmgRequired" | "stepRequirements" | "graduationYearPref" | "supervisingPhysician" | "numberOfSpots" | "housingSupport";
const ENRICH_FIELDS: EnrichField[] = [
  "shortDescription", "fullDescription", "eligibilitySummary",
  "duration", "cost", "contactEmail",
  "ecfmgRequired", "stepRequirements", "graduationYearPref",
  "supervisingPhysician", "numberOfSpots", "housingSupport",
];

function nonEmpty(v: any): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") return v.trim().length > 5;
  return true;
}

// Compute proposed change for one field, given live row + seed + auditData
function proposeFieldChange(
  field: EnrichField,
  liveValue: string | null,
  seed: Record<string, string> | undefined,
  audit: any,
): { apply: boolean; new_value?: string; source?: string; reason: string } {
  const dbLen = (liveValue || "").trim().length;
  const dbHas = dbLen > 5;

  // Look for source value in (priority order) seed > auditData
  let source: string | null = null;
  let sourceValue: string | null = null;

  if (seed && seed[field] && seed[field].trim().length > 5) {
    source = "seed";
    sourceValue = seed[field];
  }

  if (!sourceValue && audit) {
    const signals = audit.signals_detected || {};
    const excerpts: Array<{ section_heading?: string; text: string }> = audit.page_excerpts || [];
    if (field === "duration" && signals.duration_mentions?.length) {
      source = "auditData";
      sourceValue = signals.duration_mentions.slice(0, 2).join(", ");
    } else if (field === "cost" && signals.fee_mentions?.length) {
      source = "auditData";
      sourceValue = signals.fee_mentions.slice(0, 2).join(", ");
    } else if (field === "contactEmail" && signals.contact_email) {
      source = "auditData";
      sourceValue = signals.contact_email;
    } else if (field === "fullDescription" && excerpts.length) {
      // Concat first 2 excerpts (verbatim) as a long-form description, capped at 1500 chars
      const joined = excerpts.slice(0, 2).map((e) => e.text).join("\n\n").trim();
      if (joined.length > 100) {
        source = "auditData";
        sourceValue = joined.slice(0, 1500);
      }
    } else if (field === "eligibilitySummary" && excerpts.length) {
      // Find an excerpt whose section heading contains "eligib" — literal string match
      const elig = excerpts.find((e) => (e.section_heading || "").toLowerCase().indexOf("eligib") !== -1);
      if (elig) {
        source = "auditData";
        sourceValue = elig.text.slice(0, 800);
      }
    }
  }

  if (!sourceValue || sourceValue.trim().length < 5) {
    return { apply: false, reason: "no source value available" };
  }
  sourceValue = sourceValue.trim();

  // FILL (empty → value)
  if (!dbHas) {
    return {
      apply: true,
      new_value: sourceValue,
      source: source!,
      reason: `FILL (empty → ${sourceValue.length} chars from ${source})`,
    };
  }
  // ENRICH (thin → richer)
  const sourceLen = sourceValue.length;
  if (sourceLen < 100) {
    return { apply: false, reason: `source ${sourceLen} chars — not substantive enough to enrich` };
  }
  if (sourceLen < dbLen * 1.5) {
    return { apply: false, reason: `source ${sourceLen} not >= 1.5x current ${dbLen}` };
  }
  return {
    apply: true,
    new_value: sourceValue,
    source: source!,
    reason: `ENRICH ${dbLen}→${sourceLen} chars from ${source}`,
  };
}

async function main() {
  const apply = process.argv.includes("--apply");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="))?.slice("--limit=".length);
  const limit = limitArg ? Number(limitArg) : undefined;

  // Load seeds
  const seeds: Record<string, string>[] = [];
  for (const f of SEED_FILES) {
    const p = path.join(process.cwd(), f);
    if (fs.existsSync(p)) seeds.push(...parseSeedFile(p));
  }
  const seedsByTitle: Record<string, Record<string, string>> = {};
  for (const s of seeds) seedsByTitle[s.title.toLowerCase().trim()] = s;
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log(`Seed records loaded: ${seeds.length}`);

  // Read auditData via raw SQL (column exists in DB but not in current Prisma schema)
  // Everything else via standard Prisma select.
  const rowsPrisma = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true, title: true, listingType: true, status: true,
      shortDescription: true, fullDescription: true, eligibilitySummary: true,
      duration: true, cost: true, contactEmail: true,
      ecfmgRequired: true, stepRequirements: true, graduationYearPref: true,
      supervisingPhysician: true, numberOfSpots: true, housingSupport: true,
      adminNotes: true,
    },
    orderBy: { id: "asc" },
  });
  // Pull auditData JSON for the same set
  const auditRaw = await prisma.$queryRaw<Array<{ id: string; auditData: any }>>`
    SELECT id, "auditData" FROM listings WHERE status = 'APPROVED'
  `;
  const auditById = new Map(auditRaw.map((r) => [r.id, r.auditData] as const));
  const rows = rowsPrisma.map((r) => ({ ...r, auditData: auditById.get(r.id) }));
  console.log(`Listings (APPROVED): ${rows.length}${limit ? ` (limited to first ${limit})` : ""}\n`);

  const targets = limit ? rows.slice(0, limit) : rows;
  let appliedChanges = 0;
  let skippedChanges = 0;
  let listingsUpdated = 0;
  let listingsNoChange = 0;
  const failures: Array<{ db_id: string; title: string; error: string }> = [];
  const ts = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < targets.length; i++) {
    const l = targets[i];
    const seed = seedsByTitle[l.title.toLowerCase().trim()];
    console.log(`\n[${i + 1}/${targets.length}] ${l.id} | ${l.title}`);

    const filled = ENRICH_FIELDS.filter((f) => nonEmpty((l as any)[f])).length;
    console.log(`  Current: ${filled}/${ENRICH_FIELDS.length} fields filled · type=${l.listingType} · seed=${seed ? "yes" : "no"} · audit=${l.auditData ? "yes" : "no"}`);

    const planned: Array<{ field: EnrichField; new_value: string; source: string; from_len: number; to_len: number }> = [];

    for (const f of ENRICH_FIELDS) {
      const liveVal = (l as any)[f] as string | null;
      const decision = proposeFieldChange(f, liveVal, seed, l.auditData);
      if (decision.apply) {
        const fromLen = (liveVal || "").length;
        const toLen = decision.new_value!.length;
        planned.push({ field: f, new_value: decision.new_value!, source: decision.source!, from_len: fromLen, to_len: toLen });
        appliedChanges++;
        console.log(`  ✓ ${f}: ${decision.reason}`);
      } else {
        skippedChanges++;
        // silent skip when source absent — only log informative skips
      }
    }

    if (planned.length === 0) {
      console.log(`  → no applicable changes`);
      listingsNoChange++;
      continue;
    }

    if (!apply) {
      console.log(`  (dry-run; would apply ${planned.length} changes)`);
      listingsUpdated++;
      continue;
    }

    // Build update
    const updateData: Record<string, any> = {};
    const noteLines: string[] = [];
    for (const p of planned) {
      updateData[p.field] = p.new_value;
      noteLines.push(`${p.field}: ${p.from_len}→${p.to_len} chars (${p.source})`);
    }
    updateData.adminNotes = `${l.adminNotes ?? ""}\nPer-program enrich ${ts} | ${noteLines.join("; ")}`.trim();

    try {
      await prisma.listing.update({
        where: { id: l.id },
        data: updateData,
        select: { id: true },
      });
      console.log(`  ✓ updated (${planned.length} fields)`);
      listingsUpdated++;
    } catch (e: any) {
      failures.push({ db_id: l.id, title: l.title, error: e.message?.slice(0, 200) });
      console.log(`  ✗ update failed: ${e.message?.slice(0, 200)}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Summary:`);
  console.log(`  Listings processed: ${targets.length}`);
  console.log(`  Listings updated:   ${listingsUpdated}`);
  console.log(`  Listings no-change: ${listingsNoChange}`);
  console.log(`  Field changes applied: ${appliedChanges}`);
  console.log(`  Field changes skipped: ${skippedChanges}`);
  if (failures.length) {
    console.log(`\n  Failures (${failures.length}):`);
    for (const f of failures) console.log(`    ${f.db_id} ${f.title}: ${f.error}`);
  }

  fs.writeFileSync("scripts/enrich-listings-result.json", JSON.stringify({
    ran_at: new Date().toISOString(),
    mode: apply ? "APPLY" : "DRY-RUN",
    summary: { listings_processed: targets.length, listings_updated: listingsUpdated, listings_no_change: listingsNoChange, changes_applied: appliedChanges, changes_skipped: skippedChanges, failures: failures.length },
    failures,
  }, null, 2));
  console.log(`\nWrote scripts/enrich-listings-result.json`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
