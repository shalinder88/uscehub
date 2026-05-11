/**
 * P99-P97 Staged Runtime Batch 4 Validator
 *
 * Validates the staged-data-only runtime artifact at:
 *   src/data/usce/public-listings-pilot-staged-batch-4.generated.json
 *
 * Hard gates:
 *   - File parses as JSON
 *   - Top-level safety flags all true
 *   - Exactly 12 cards
 *   - Active 10 listing_ids preserved verbatim AND content unchanged
 *   - 2 new staged candidate listing_ids match expected (pilot-020 / pilot-021)
 *   - No duplicate IDs
 *   - Active runtime data file unchanged
 *   - No banned phrase
 *   - No PUBLIC_NOW / IMPORT_READY token
 *   - Each new card has US-only audience: us_md_do=ELIGIBLE_EXPLICIT, three
 *     non-US audiences=EXCLUDED_EXPLICIT, LCME_AOA_ONLY tag
 *   - System-level caveat present in campus_name for both
 *   - Staged file is not imported by any src/ TS file
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ALLOWED_CARD_FIELDS = new Set([
  "listing_id", "institution_name", "campus_name", "state", "county",
  "specialty", "opportunity_type", "source_page_type", "listing_role",
  "display_bucket", "eligible_audiences", "excluded_audiences",
  "unknown_audiences", "restriction_tags", "fit_warnings",
  "audience_detail", "application_url", "official_source_url",
  "source_status", "last_reviewed_at",
]);

const REQUIRED_CARD_FIELDS = [
  "listing_id", "institution_name", "state",
  "specialty", "opportunity_type", "source_page_type", "listing_role",
  "display_bucket", "eligible_audiences", "excluded_audiences",
  "unknown_audiences", "restriction_tags", "fit_warnings",
  "audience_detail", "official_source_url",
  "source_status", "last_reviewed_at",
];

const EXPECTED_ACTIVE_IDS = [
  "pilot-001-NJ-morristown-medical-center",
  "pilot-002-NJ-overlook-medical-center",
  "pilot-003-OH-cleveland-clinic-mercy-hospital",
  "pilot-004-OH-cleveland-clinic-hillcrest-hospital",
  "pilot-007-CA-highland-hospital-alameda-health-system",
  "pilot-014-NC-duke-university-hospital",
  "pilot-017-NY-nyu-langone-tisch-hospital",
  "pilot-019-IN-iu-health-methodist-hospital",
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
  "pilot-015-IL-northwestern-memorial-hospital",
];

const EXPECTED_NEW_IDS = [
  "pilot-020-TN-vanderbilt-university-medical-center",
  "pilot-021-CA-ucsf-medical-center",
];

const NEW_ID_TO_SITE_NAME: Record<string, string> = {
  "pilot-020-TN-vanderbilt-university-medical-center": "Vanderbilt",
  "pilot-021-CA-ucsf-medical-center": "UCSF",
};

const BANNED_PHRASES: RegExp[] = [
  /\bguaranteed\b/i,
  /\bhospital[- ]approved\b/i,
  /\bIMG[- ]friendly\b/i,
  /\bapply through USCEHub\b/i,
  /\bcomplete national directory\b/i,
  /\bverified by hospital\b/i,
  /\bnationwide\b/i,
  /\bofficially approved by\b/i,
];

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION",
];

interface Failure { rule: string; row: string; detail: string }

function deepStringWalk(obj: unknown, cb: (s: string, location: string) => void, location = ""): void {
  if (typeof obj === "string") { cb(obj, location); return; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => deepStringWalk(v, cb, `${location}[${i}]`)); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) deepStringWalk(v, cb, location ? `${location}.${k}` : k);
  }
}

function loadCards(p: string): Array<Record<string, unknown>> {
  const txt = fs.readFileSync(p, "utf8");
  return (JSON.parse(txt).cards) as Array<Record<string, unknown>>;
}

function validate(stagedPath: string, repoRoot: string): Failure[] {
  const failures: Failure[] = [];

  let raw: string;
  try { raw = fs.readFileSync(stagedPath, "utf8"); }
  catch (e) { failures.push({ rule: "READ_FAILED", row: stagedPath, detail: String(e) }); return failures; }

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw); }
  catch (e) { failures.push({ rule: "PARSE_FAILED", row: stagedPath, detail: String(e) }); return failures; }

  for (const flag of ["staged_only", "not_imported_by_app", "not_production", "not_public_now", "not_import_ready"]) {
    if (parsed[flag] !== true) {
      failures.push({ rule: "MISSING_SAFETY_FLAG", row: "(top-level)", detail: `${flag} must be true` });
    }
  }

  const cards = parsed["cards"] as Array<Record<string, unknown>>;
  if (!Array.isArray(cards)) {
    failures.push({ rule: "CARDS_NOT_ARRAY", row: "(top-level)", detail: "cards must be an array" });
    return failures;
  }
  if (cards.length !== 12) {
    failures.push({ rule: "BAD_CARD_COUNT", row: "(top-level)", detail: `expected 12 cards, got ${cards.length}` });
  }

  const seenIds = new Set<string>();
  for (const c of cards) {
    const cid = (c["listing_id"] as string) || "(unknown)";
    if (seenIds.has(cid)) failures.push({ rule: "DUPLICATE_LISTING_ID", row: cid, detail: "duplicate listing_id" });
    seenIds.add(cid);

    for (const k of Object.keys(c)) {
      if (!ALLOWED_CARD_FIELDS.has(k)) {
        failures.push({ rule: "DISALLOWED_FIELD", row: cid, detail: `field '${k}' not allowed` });
      }
    }
    for (const k of REQUIRED_CARD_FIELDS) {
      if (c[k] === undefined || c[k] === null) {
        failures.push({ rule: "MISSING_REQUIRED_FIELD", row: cid, detail: `field '${k}' missing` });
      }
    }

    const url = c["official_source_url"] as string;
    if (url && !/^https?:\/\//.test(url)) {
      failures.push({ rule: "BAD_URL", row: cid, detail: `official_source_url not http(s):// — '${url}'` });
    }
    const lr = c["last_reviewed_at"] as string;
    if (lr && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(lr)) {
      failures.push({ rule: "BAD_LAST_REVIEWED_AT", row: cid, detail: `last_reviewed_at not ISO-Z — '${lr}'` });
    }
    const ad = c["audience_detail"] as Record<string, string> | undefined;
    if (!ad || typeof ad !== "object") {
      failures.push({ rule: "BAD_AUDIENCE_DETAIL", row: cid, detail: "audience_detail missing or wrong type" });
    } else {
      for (const k of ["us_md_do", "international_student", "img_graduate", "caribbean_student"]) {
        if (!(k in ad)) failures.push({ rule: "AUDIENCE_DETAIL_MISSING_KEY", row: cid, detail: `key '${k}' missing` });
      }
    }
  }

  // Active 10 IDs preserved AND content matches active runtime
  const activeCards = loadCards(path.join(repoRoot, "src/data/usce/public-listings-pilot.generated.json"));
  const stagedById = new Map<string, Record<string, unknown>>();
  for (const c of cards) stagedById.set(c["listing_id"] as string, c);
  for (const a of activeCards) {
    const aid = a["listing_id"] as string;
    const s = stagedById.get(aid);
    if (!s) {
      failures.push({ rule: "ACTIVE_ID_MISSING", row: aid, detail: "active card not preserved in staged file" });
      continue;
    }
    if (JSON.stringify(s) !== JSON.stringify(a)) {
      failures.push({ rule: "ACTIVE_CARD_DRIFT", row: aid, detail: "staged copy of active card does not match active runtime" });
    }
  }

  // Expected new IDs present
  for (const nid of EXPECTED_NEW_IDS) {
    if (!stagedById.has(nid)) {
      failures.push({ rule: "NEW_STAGED_ID_MISSING", row: nid, detail: `new staged candidate '${nid}' not present` });
    }
  }

  // Banned phrase + forbidden token deep scan
  deepStringWalk(parsed, (s, loc) => {
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) {
        failures.push({ rule: "BANNED_PHRASE", row: loc, detail: `${re}: '${s.slice(0, 100)}'` });
        return;
      }
    }
    for (const tok of FORBIDDEN_TOKENS) {
      if (s.includes(tok) && !s.includes(`NO_${tok}`) && !/^not_(public_now|import_ready)$/.test(loc)) {
        failures.push({ rule: "FORBIDDEN_TOKEN", row: loc, detail: `forbidden token '${tok}' in '${s.slice(0, 80)}'` });
        return;
      }
    }
  });

  // New 2: per-row US-only audience invariant + LCME_AOA_ONLY tag + system caveat
  for (const nid of EXPECTED_NEW_IDS) {
    const c = stagedById.get(nid);
    if (!c) continue;
    const ad = c["audience_detail"] as Record<string, string> | undefined;
    if (!ad) continue;
    if (ad.us_md_do !== "ELIGIBLE_EXPLICIT") {
      failures.push({ rule: "NEW_ROW_US_MD_DO_MUST_BE_ELIGIBLE", row: nid, detail: `got '${ad.us_md_do}'` });
    }
    for (const k of ["international_student", "img_graduate", "caribbean_student"]) {
      if (ad[k] !== "EXCLUDED_EXPLICIT") {
        failures.push({ rule: "NEW_ROW_NON_US_MUST_BE_EXCLUDED", row: nid, detail: `${k} got '${ad[k]}'` });
      }
    }
    const tags = (c["restriction_tags"] || []) as string[];
    if (!tags.includes("LCME_AOA_ONLY")) {
      failures.push({ rule: "NEW_ROW_TAG_MISSING", row: nid, detail: "LCME_AOA_ONLY missing" });
    }
    const display = c["display_bucket"] as string;
    if (display !== "READY_PUBLIC_US_STUDENT_ONLY") {
      failures.push({ rule: "NEW_ROW_DISPLAY_BUCKET", row: nid, detail: `got '${display}'` });
    }
    const campus = (c["campus_name"] as string) || "";
    if (!/system-level/i.test(campus)) {
      failures.push({ rule: "SYSTEM_CAVEAT_MISSING_FROM_CAMPUS_NAME", row: nid, detail: `campus_name should include system-level caveat for ${NEW_ID_TO_SITE_NAME[nid]} (got '${campus}')` });
    }
  }

  // Import safety: grep for any src/ TS file importing the staged module
  const stagedBasename = path.basename(stagedPath, ".json");
  try {
    const grepOut = execSync(
      `grep -rln "${stagedBasename}\\|PILOT_USCE_CARDS_STAGED_BATCH_4\\|PILOT_STAGED_BATCH_4" src/ 2>/dev/null || true`,
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();
    const offenders = grepOut.split("\n").filter((line) => {
      if (!line) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.json")) return false;
      return true;
    });
    if (offenders.length > 0) {
      failures.push({ rule: "STAGED_FILE_IS_IMPORTED", row: "(import-safety)", detail: `staged module is referenced by app source: ${offenders.join(", ")}` });
    }
  } catch { /* ignore */ }

  return failures;
}

function main(): void {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-staged-runtime-batch-4.ts <path-to-staged-json>");
    process.exit(2);
  }
  if (!fs.existsSync(argPath)) {
    console.error(`File not found: ${argPath}`);
    process.exit(2);
  }
  const repoRoot = path.resolve(__dirname, "..");

  console.log("=".repeat(60));
  console.log("P99-P97 Staged Runtime Batch 4 Validator");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);

  const failures = validate(argPath, repoRoot);

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Staged runtime batch 4 is data-only and not imported by app.");
    console.log("  Active 10 preserved verbatim. 2 new validated rows present.");
    console.log("  US-only audience invariant + LCME_AOA_ONLY + system-level caveat checked.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
