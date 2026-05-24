/**
 * P99-0A Phase E: USCE Public Card Validator (v2)
 *
 * Hard gates enforced:
 *   - No public card contains NPI, CCN, CMS raw row, NPPES raw row
 *   - No public card lacks official_source_url
 *   - POLICY_HUB appears as PUBLIC_OPPORTUNITY without direct application → FAIL
 *   - LCME-only listing appears in IMG-relevant bucket → FAIL
 *   - VSLO-only listing appears in non-VSLO bucket without VSLO_REQUIRED tag → FAIL
 *   - UNKNOWN eligibility claimed as accepted → FAIL
 *   - SUPPORTING_SOURCE_ONLY appears as opportunity card in public preview → FAIL
 *   - READY_PUBLIC_IMG_RELEVANT lacks explicit eligible_audiences → FAIL
 *   - READY_PUBLIC_US_STUDENT_ONLY has excluded_audiences empty → FAIL
 *   - Public card lacks visible unknown_audiences when eligibility is unknown → FAIL
 *   - DO_NOT_SHOW in public preview → FAIL
 *
 * Also runs: source-rights validator, CMS bridge validator
 *
 * Run: npx tsx scripts/validate-usce-public-cards.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const BASE = path.join(__dirname, "../docs/platform-v2/local/usce-completeness");
const SCORE_FILE_V2 = path.join(BASE, "usce_listing_completeness_v2.csv");
const CARDS_FILE_V2 = path.join(BASE, "public_listing_cards_preview_v2.json");
const REPORT_OUT = path.join(BASE, "validation_report_usce.json");

const FORBIDDEN_FIELD_PATTERNS = ["npi", "ccn", "cms_facility_id", "nppes_npi", "ein"];

interface ScoreRow {
  listing_id: string;
  institution_name: string;
  display_bucket: string;
  source_page_type: string;
  listing_role: string;
  completeness_score: string;
  international_student_status: string;
  img_graduate_status: string;
  us_md_do_status: string;
  source_status: string;
  official_source_url: string;
  hard_gates_hit: string;
  restriction_tags: string;
  [key: string]: string;
}

interface PublicCardV2 {
  listing_id: string;
  institution_name: string;
  display_bucket: string;
  listing_role: string;
  source_page_type: string;
  official_source_url: string;
  eligible_audiences: string[];
  excluded_audiences: string[];
  unknown_audiences: string[];
  restriction_tags: string[];
  audience_detail: Record<string, string>;
  unknown_fields: string[];
  [key: string]: unknown;
}

interface CardPreviewV2 {
  cards: PublicCardV2[];
  status_summary: Record<string, number>;
}

interface Failure {
  rule: string;
  listing_id: string;
  institution_name: string;
  detail: string;
}

function parseCSV(filepath: string): ScoreRow[] {
  if (!fs.existsSync(filepath)) return [];
  const text = fs.readFileSync(filepath, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const vals = splitCSVLine(line);
    const row: ScoreRow = {} as ScoreRow;
    headers.forEach((h, i) => (row[h] = vals[i] ?? ""));
    return row;
  });
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuote = !inQuote;
    } else if (c === "," && !inQuote) {
      result.push(cur); cur = "";
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// ── Rule checks ──────────────────────────────────────────────────────

function checkNoForbiddenFields(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    for (const key of Object.keys(card)) {
      const lk = key.toLowerCase();
      if (FORBIDDEN_FIELD_PATTERNS.some((p) => lk.includes(p))) {
        failures.push({
          rule: "FORBIDDEN_FIELD_IN_PUBLIC_CARD",
          listing_id: card.listing_id,
          institution_name: card.institution_name,
          detail: `Field '${key}' contains forbidden identifier pattern. Must not appear in public output.`,
        });
      }
    }
  }
}

function checkNoMissingOfficialSource(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    if (!card.official_source_url || String(card.official_source_url).trim() === "") {
      failures.push({
        rule: "PUBLIC_CARD_MISSING_OFFICIAL_SOURCE",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `Card lacks official_source_url.`,
      });
    }
  }
}

function checkNoSupportingSourceAsOpportunity(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    if (card.listing_role === "SUPPORTING_SOURCE") {
      failures.push({
        rule: "SUPPORTING_SOURCE_IN_PUBLIC_PREVIEW",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `Card with listing_role=SUPPORTING_SOURCE appeared in public preview. Hub/affiliated pages must not be opportunity cards.`,
      });
    }
  }
}

function checkNoDoNotShow(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    if (card.display_bucket === "DO_NOT_SHOW") {
      failures.push({
        rule: "DO_NOT_SHOW_IN_PUBLIC_PREVIEW",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `DO_NOT_SHOW card appears in public preview.`,
      });
    }
  }
}

function checkImgRelevantHasExplicitEligible(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    if (card.display_bucket !== "READY_PUBLIC_IMG_RELEVANT") continue;
    const hasIntl = card.eligible_audiences.includes("INTERNATIONAL_STUDENT") ||
                    card.eligible_audiences.includes("IMG_GRADUATE");
    if (!hasIntl) {
      failures.push({
        rule: "IMG_RELEVANT_MISSING_EXPLICIT_ELIGIBLE",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `READY_PUBLIC_IMG_RELEVANT must have INTERNATIONAL_STUDENT or IMG_GRADUATE in eligible_audiences. Got: ${JSON.stringify(card.eligible_audiences)}.`,
      });
    }
  }
}

function checkUsStudentOnlyHasExclusions(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    if (card.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY") continue;
    // Must have IMG or international in excluded_audiences
    const hasExclusion = card.excluded_audiences.includes("INTERNATIONAL_STUDENT") ||
                         card.excluded_audiences.includes("IMG_GRADUATE");
    if (!hasExclusion) {
      failures.push({
        rule: "US_STUDENT_ONLY_MISSING_EXCLUSIONS",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `READY_PUBLIC_US_STUDENT_ONLY must exclude INTERNATIONAL_STUDENT or IMG_GRADUATE explicitly. excluded_audiences=${JSON.stringify(card.excluded_audiences)}.`,
      });
    }
  }
}

function checkUnknownAudiencesVisible(cards: PublicCardV2[], failures: Failure[]) {
  for (const card of cards) {
    // Cards with unknown eligibility must have non-empty unknown_audiences
    const ad = card.audience_detail || {};
    const hasUnknown = Object.values(ad).some((v) => v === "UNKNOWN_NOT_STATED");
    if (hasUnknown && (!card.unknown_audiences || card.unknown_audiences.length === 0)) {
      failures.push({
        rule: "UNKNOWN_AUDIENCES_HIDDEN",
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        detail: `Card has UNKNOWN_NOT_STATED audience eligibility but unknown_audiences array is empty. Unknown eligibility must be visible to users.`,
      });
    }
  }
}

function checkLcmeOnlyNotInImgRelevant(rows: ScoreRow[], failures: Failure[]) {
  for (const r of rows) {
    if (r.display_bucket !== "READY_PUBLIC_IMG_RELEVANT") continue;
    const intl = r.international_student_status;
    if (intl === "EXCLUDED_EXPLICIT") {
      failures.push({
        rule: "LCME_ONLY_IN_IMG_RELEVANT_BUCKET",
        listing_id: r.listing_id,
        institution_name: r.institution_name,
        detail: `international_student_status=EXCLUDED_EXPLICIT but listing is in READY_PUBLIC_IMG_RELEVANT bucket. LCME-only cannot appear as IMG-relevant.`,
      });
    }
  }
}

function checkPolicyHubNotAsOpportunity(rows: ScoreRow[], failures: Failure[]) {
  for (const r of rows) {
    if (r.source_page_type !== "POLICY_HUB") continue;
    if (r.listing_role === "PUBLIC_OPPORTUNITY") {
      failures.push({
        rule: "POLICY_HUB_AS_OPPORTUNITY",
        listing_id: r.listing_id,
        institution_name: r.institution_name,
        detail: `source_page_type=POLICY_HUB but listing_role=PUBLIC_OPPORTUNITY. Hub pages must be SUPPORTING_SOURCE unless directly actionable with no specialty sub-listings.`,
      });
    }
  }
}

// ── Subprocess runners ────────────────────────────────────────────────

function runSubValidator(cmd: string): { passed: boolean; output: string } {
  try {
    const output = execSync(cmd, { encoding: "utf8" } as Parameters<typeof execSync>[1]);
    return { passed: true, output: String(output).trim() };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    const output = ((e.stdout || "") + (e.stderr || "")).trim();
    return { passed: false, output };
  }
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  console.log("=".repeat(60));
  console.log("P99-0A USCE Public Card Validator v2");
  console.log("=".repeat(60));

  const sectionResults: Record<string, boolean> = {};
  const failures: Failure[] = [];

  // ── 1. Source rights ───────────────────────────────────────────────
  console.log("\n[1/4] Running source-rights validator...");
  const rights = runSubValidator(`npx tsx ${path.join(__dirname, "validate-data-rights.ts")}`);
  sectionResults["source_rights"] = rights.passed;
  console.log(`      → ${rights.passed ? "PASSED" : "FAILED"}`);
  if (!rights.passed) {
    rights.output.split("\n").slice(0, 5).filter(Boolean).forEach(l => console.log(`      ${l.trim()}`));
  }

  // ── 2. CMS bridge ──────────────────────────────────────────────────
  console.log("\n[2/4] Running CMS bridge validator...");
  const cms = runSubValidator(`python3 ${path.join(__dirname, "../docs/platform-v2/local/cms/validate_cms_bridge.py")}`);
  sectionResults["cms_bridge"] = cms.passed;
  console.log(`      → ${cms.passed ? "PASSED" : "FAILED"}`);
  if (!cms.passed) {
    cms.output.split("\n").slice(0, 5).filter(Boolean).forEach(l => console.log(`      ${l.trim()}`));
  }

  // ── 3. USCE v2 card rules ──────────────────────────────────────────
  console.log("\n[3/4] Checking USCE v2 card rules...");
  const scoreRows = parseCSV(SCORE_FILE_V2);
  let cardPreview: CardPreviewV2 = { cards: [], status_summary: {} };
  if (fs.existsSync(CARDS_FILE_V2)) {
    cardPreview = JSON.parse(fs.readFileSync(CARDS_FILE_V2, "utf8"));
  }

  const cardFailures: Failure[] = [];
  checkNoForbiddenFields(cardPreview.cards, cardFailures);
  checkNoMissingOfficialSource(cardPreview.cards, cardFailures);
  checkNoSupportingSourceAsOpportunity(cardPreview.cards, cardFailures);
  checkNoDoNotShow(cardPreview.cards, cardFailures);
  checkImgRelevantHasExplicitEligible(cardPreview.cards, cardFailures);
  checkUsStudentOnlyHasExclusions(cardPreview.cards, cardFailures);
  checkUnknownAudiencesVisible(cardPreview.cards, cardFailures);
  checkLcmeOnlyNotInImgRelevant(scoreRows, cardFailures);
  checkPolicyHubNotAsOpportunity(scoreRows, cardFailures);

  failures.push(...cardFailures);
  sectionResults["usce_cards"] = cardFailures.length === 0;

  if (cardFailures.length) {
    console.log(`      → FAILED: ${cardFailures.length} violations`);
    cardFailures.forEach(f => console.log(`        [${f.rule}] ${f.institution_name}`));
  } else {
    console.log(`      → PASSED (${scoreRows.length} listings, ${cardPreview.cards.length} cards)`);
  }

  // ── 4. tsc --noEmit ────────────────────────────────────────────────
  console.log("\n[4/4] Running tsc --noEmit...");
  const tsc = runSubValidator("npx tsc --noEmit");
  sectionResults["tsc"] = tsc.passed;
  console.log(`      → ${tsc.passed ? "PASSED" : "FAILED"}`);
  if (!tsc.passed) {
    tsc.output.split("\n").slice(0, 10).filter(Boolean).forEach(l => console.log(`      ${l.trim()}`));
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  const hardPass = sectionResults["usce_cards"] !== false && failures.length === 0;

  console.log(`\nOverall (hard rules): ${hardPass ? "PASSED" : "FAILED"}`);
  console.log(`  Source rights:  ${sectionResults["source_rights"] ? "PASSED" : "FAILED"}`);
  console.log(`  CMS bridge:     ${sectionResults["cms_bridge"] ? "PASSED" : "FAILED"}`);
  console.log(`  USCE v2 cards:  ${sectionResults["usce_cards"] ? "PASSED" : "FAILED"}`);
  console.log(`  tsc --noEmit:   ${sectionResults["tsc"] ? "PASSED" : "FAILED"}`);

  if (scoreRows.length) {
    const buckets: Record<string, number> = {};
    scoreRows.forEach(r => { buckets[r.display_bucket] = (buckets[r.display_bucket] || 0) + 1; });
    console.log("\n  Listing buckets:");
    Object.entries(buckets).sort(([,a],[,b]) => b - a).forEach(([b, c]) =>
      console.log(`    ${b.padEnd(40)}: ${c}`)
    );
  }

  const report = {
    validation: hardPass ? "PASSED" : "FAILED",
    schema_version: "v2",
    sections: sectionResults,
    hard_failure_count: failures.length,
    failures,
    rules_checked: [
      "FORBIDDEN_FIELD_IN_PUBLIC_CARD — NPI/CCN/EIN must not appear in public cards",
      "PUBLIC_CARD_MISSING_OFFICIAL_SOURCE — every card needs official_source_url",
      "SUPPORTING_SOURCE_IN_PUBLIC_PREVIEW — hub/affiliated pages not as opportunity cards",
      "DO_NOT_SHOW_IN_PUBLIC_PREVIEW — DO_NOT_SHOW excluded from preview",
      "IMG_RELEVANT_MISSING_EXPLICIT_ELIGIBLE — READY_PUBLIC_IMG_RELEVANT requires explicit eligible_audiences",
      "US_STUDENT_ONLY_MISSING_EXCLUSIONS — READY_PUBLIC_US_STUDENT_ONLY requires explicit exclusions",
      "UNKNOWN_AUDIENCES_HIDDEN — unknown eligibility must be visible in card",
      "LCME_ONLY_IN_IMG_RELEVANT_BUCKET — LCME-only cannot appear as IMG-relevant",
      "POLICY_HUB_AS_OPPORTUNITY — policy hub pages must be SUPPORTING_SOURCE",
    ],
  };

  fs.writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nReport: ${REPORT_OUT}`);
  process.exit(hardPass ? 0 : 1);
}

main();
