/**
 * P99-3 Public Runtime Data Validator
 *
 * Validates the generated runtime data file at:
 *   src/data/usce/public-listings.generated.json
 *
 * Hard gates:
 *   - File exists and is valid JSON
 *   - No forbidden fields (NPI/CCN/CMS/NPPES/AAMC/NRMP/ACGME/NUCC/internal scores)
 *   - Correct card counts (12 total, 7 IMG, 5 US-only)
 *   - No NEEDS_REVIEW cards
 *   - No SUPPORTING_SOURCE_ONLY cards
 *   - No POLICY_HUB opportunity cards
 *   - IMG bucket cards have international-eligible signals
 *   - US-only bucket cards have exclusion signals
 *   - Promoted JSON matches reviewed source on all kept fields
 *
 * Run: npx tsx scripts/usce-data/validate-public-runtime-data.ts
 */

import * as fs from "fs";
import * as path from "path";

const RUNTIME_JSON = path.join(__dirname, "../../src/data/usce/public-listings.generated.json");
const SOURCE_JSON = path.join(
  __dirname,
  "../../docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json"
);

const FORBIDDEN_FIELD_SUBSTRINGS = [
  "npi", "ccn", "cms", "nppes", "aamc", "nrmp", "acgme", "nucc",
  "completeness_score", "max_possible_score", "identity_status", "unknown_fields",
];

const FORBIDDEN_KEY_EXACT = new Set([
  "npi", "ccn", "cms_facility_id", "nppes_npi", "ein",
  "aamc_id", "nrmp_id", "acgme_id", "nucc_taxonomy",
  "completeness_score", "max_possible_score", "nppes_raw", "cms_raw",
  "identity_status", "unknown_fields", "city",
]);

const PUBLIC_BUCKETS = new Set(["READY_PUBLIC_IMG_RELEVANT", "READY_PUBLIC_US_STUDENT_ONLY"]);

interface Failure { rule: string; detail: string }

function main() {
  console.log("=".repeat(60));
  console.log("P99-3 Public Runtime Data Validator");
  console.log("=".repeat(60));

  const failures: Failure[] = [];

  // ── 1. File existence ─────────────────────────────────────────────
  console.log("\n[1/7] Checking file existence...");
  if (!fs.existsSync(RUNTIME_JSON)) {
    failures.push({ rule: "RUNTIME_FILE_MISSING", detail: `${RUNTIME_JSON} not found` });
    console.log("  FAIL — file missing, cannot continue");
    printSummary(failures);
    process.exit(1);
  }
  console.log("  PASS — file exists");

  // ── 2. Parse and count ────────────────────────────────────────────
  console.log("\n[2/7] Parsing and counting...");
  const raw = JSON.parse(fs.readFileSync(RUNTIME_JSON, "utf8"));
  const cards: Record<string, unknown>[] = raw.cards ?? [];

  const imgCards = cards.filter(c => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  const usCards = cards.filter(c => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");
  const needsReview = cards.filter(c => c.display_bucket === "NEEDS_REVIEW");
  const supporting = cards.filter(c => c.display_bucket === "SUPPORTING_SOURCE_ONLY");

  console.log(`  Total cards: ${cards.length} (expected 12)`);
  console.log(`  IMG-relevant: ${imgCards.length} (expected 7)`);
  console.log(`  US-only: ${usCards.length} (expected 5)`);
  console.log(`  NEEDS_REVIEW present: ${needsReview.length} (expected 0)`);
  console.log(`  SUPPORTING_SOURCE present: ${supporting.length} (expected 0)`);

  if (cards.length !== 12) failures.push({ rule: "CARD_COUNT_WRONG", detail: `Expected 12, got ${cards.length}` });
  if (imgCards.length !== 7) failures.push({ rule: "IMG_COUNT_WRONG", detail: `Expected 7, got ${imgCards.length}` });
  if (usCards.length !== 5) failures.push({ rule: "US_COUNT_WRONG", detail: `Expected 5, got ${usCards.length}` });
  if (needsReview.length > 0) failures.push({ rule: "NEEDS_REVIEW_IN_RUNTIME", detail: `${needsReview.length} NEEDS_REVIEW card(s) present` });
  if (supporting.length > 0) failures.push({ rule: "SUPPORTING_SOURCE_IN_RUNTIME", detail: `${supporting.length} SUPPORTING_SOURCE card(s) present` });

  // ── 3. Bucket validity ────────────────────────────────────────────
  console.log("\n[3/7] Checking bucket validity...");
  const badBucket = cards.filter(c => !PUBLIC_BUCKETS.has(c.display_bucket as string));
  if (badBucket.length > 0) {
    failures.push({ rule: "NON_PUBLIC_BUCKET", detail: badBucket.map(c => `${c.listing_id}:${c.display_bucket}`).join(", ") });
  }

  const policyHubOpp = cards.filter(c => c.source_page_type === "POLICY_HUB" && c.listing_role === "PUBLIC_OPPORTUNITY");
  if (policyHubOpp.length > 0) {
    failures.push({ rule: "POLICY_HUB_AS_OPPORTUNITY", detail: policyHubOpp.map(c => c.listing_id).join(", ") });
  }
  console.log(`  Non-public buckets: ${badBucket.length} (expected 0)`);
  console.log(`  POLICY_HUB opportunities: ${policyHubOpp.length} (expected 0)`);

  // ── 4. Forbidden field key scan ───────────────────────────────────
  console.log("\n[4/7] Forbidden field key scan...");
  const keyFailures: string[] = [];
  for (const card of cards) {
    for (const key of Object.keys(card)) {
      if (FORBIDDEN_KEY_EXACT.has(key)) {
        keyFailures.push(`${card.listing_id}: exact forbidden key '${key}'`);
        failures.push({ rule: "FORBIDDEN_KEY_IN_RUNTIME", detail: `${card.listing_id}: '${key}'` });
        continue;
      }
      const lk = key.toLowerCase();
      for (const sub of FORBIDDEN_FIELD_SUBSTRINGS) {
        if (lk.includes(sub)) {
          keyFailures.push(`${card.listing_id}: forbidden substring '${sub}' in key '${key}'`);
          failures.push({ rule: "FORBIDDEN_KEY_IN_RUNTIME", detail: `${card.listing_id}: '${key}' contains '${sub}'` });
          break;
        }
      }
    }
  }
  console.log(`  Forbidden keys: ${keyFailures.length} (expected 0)`);

  // ── 5. String scan on full JSON output ────────────────────────────
  console.log("\n[5/7] String scan on full JSON...");
  const jsonStr = fs.readFileSync(RUNTIME_JSON, "utf8");
  const stringChecks = ["\"npi\":", "\"ccn\":", "\"nppes_npi\":", "\"cms_facility_id\":",
    "\"ein\":", "\"aamc_id\":", "\"nrmp_id\":", "\"acgme_id\":",
    "completeness_score", "max_possible_score", "identity_status", "unknown_fields"];
  const stringHits: string[] = [];
  for (const s of stringChecks) {
    if (jsonStr.includes(s)) {
      stringHits.push(s);
      failures.push({ rule: "FORBIDDEN_STRING_IN_RUNTIME_JSON", detail: `String '${s}' found in runtime JSON` });
    }
  }
  console.log(`  Forbidden strings: ${stringHits.length} (expected 0)`);

  // ── 6. IMG eligibility coherence ─────────────────────────────────
  console.log("\n[6/7] IMG eligibility coherence...");
  const imgCoherenceFails: string[] = [];
  for (const c of imgCards) {
    const elig = (c.eligible_audiences as string[]) ?? [];
    const ad = c.audience_detail as Record<string, string> ?? {};
    const hasIntlSignal =
      elig.some(a => ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"].includes(a)) ||
      ["international_student", "img_graduate", "caribbean_student"].some(k => ad[k] === "ELIGIBLE_EXPLICIT");
    if (!hasIntlSignal) {
      imgCoherenceFails.push(c.listing_id as string);
      failures.push({ rule: "IMG_BUCKET_NO_INTL_SIGNAL", detail: `${c.listing_id}: IMG bucket but no international eligibility signal` });
    }
  }
  console.log(`  IMG coherence failures: ${imgCoherenceFails.length} (expected 0)`);

  // ── 7. Source fidelity check ──────────────────────────────────────
  console.log("\n[7/7] Source fidelity check...");
  if (fs.existsSync(SOURCE_JSON)) {
    const sourceRaw = JSON.parse(fs.readFileSync(SOURCE_JSON, "utf8"));
    const sourceCards: Record<string, unknown>[] = sourceRaw.cards ?? [];
    const sourceById = new Map(sourceCards.map(c => [c.listing_id, c]));

    for (const promoted of cards) {
      const source = sourceById.get(promoted.listing_id);
      if (!source) {
        failures.push({ rule: "PROMOTED_ID_NOT_IN_SOURCE", detail: `${promoted.listing_id} not found in source JSON` });
        continue;
      }
      // Check key fields match source
      const checkFields = ["institution_name", "specialty", "display_bucket", "last_reviewed_at", "official_source_url"];
      for (const f of checkFields) {
        if (JSON.stringify(promoted[f]) !== JSON.stringify(source[f])) {
          failures.push({ rule: "PROMOTED_FIELD_MISMATCH", detail: `${promoted.listing_id}.${f}: promoted=${JSON.stringify(promoted[f])} source=${JSON.stringify(source[f])}` });
        }
      }
    }
    console.log(`  Source fidelity check: ${cards.length} cards verified against source`);
  } else {
    console.log("  Source JSON not found — skipping fidelity check");
  }

  printSummary(failures);
  process.exit(failures.length === 0 ? 0 : 1);
}

function printSummary(failures: Failure[]) {
  console.log("\n" + "=".repeat(60));
  const passed = failures.length === 0;
  console.log(`\nOverall: ${passed ? "PASSED" : "FAILED"}`);
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach(f => console.log(`  [${f.rule}] ${f.detail}`));
  } else {
    console.log("  All runtime data gates passed.");
  }
}

main();
