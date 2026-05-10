/**
 * P99-P97 Staged Runtime Batch 2 Validator
 *
 * Validates the staged-data-only runtime artifact at:
 *   src/data/usce/public-listings-pilot-staged-batch-2.generated.json
 *
 * The staged file lives under src/data/ but must NOT be imported by any app
 * code. This validator enforces the safety contract.
 *
 * Run:
 *   npx tsx scripts/validate-p99-staged-runtime-batch-2.ts <path-to-staged-json>
 *
 * Hard gates:
 *   - File parses as JSON
 *   - Top-level safety flags all true (staged_only, not_imported_by_app, not_production, not_public_now, not_import_ready)
 *   - Exactly 7 cards
 *   - Active 5 listing_ids preserved verbatim AND active card content unchanged
 *   - 2 staged candidate listing_ids match expected (pilot-011 / pilot-012)
 *   - Each card uses only the active runtime allow-list of fields
 *   - URLs http(s)://, last_reviewed_at ISO-Z
 *   - audience_detail has all 4 required keys
 *   - No banned phrase in any string field
 *   - No PUBLIC_NOW / IMPORT_READY token
 *   - UPMC required restrictions present
 *   - Lincoln required restrictions present
 *   - System-level placement caveat present (campus_name) for pilot-011 and pilot-012
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
];

const EXPECTED_STAGED_IDS = [
  "pilot-011-PA-upmc-western-psychiatric-hospital",
  "pilot-012-NY-nyc-health-hospitals-lincoln",
];

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

const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];

interface Failure { rule: string; row: string; detail: string }

function deepStringWalk(obj: unknown, cb: (s: string, location: string) => void, location = ""): void {
  if (typeof obj === "string") { cb(obj, location); return; }
  if (Array.isArray(obj)) { obj.forEach((v, i) => deepStringWalk(v, cb, `${location}[${i}]`)); return; }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) deepStringWalk(v, cb, location ? `${location}.${k}` : k);
  }
}

function loadActiveCards(repoRoot: string): Array<Record<string, unknown>> {
  const p = path.join(repoRoot, "src/data/usce/public-listings-pilot.generated.json");
  const txt = fs.readFileSync(p, "utf8");
  const parsed = JSON.parse(txt);
  return parsed.cards as Array<Record<string, unknown>>;
}

function validate(stagedPath: string, repoRoot: string): Failure[] {
  const failures: Failure[] = [];

  let raw: string;
  try { raw = fs.readFileSync(stagedPath, "utf8"); }
  catch (e) { failures.push({ rule: "READ_FAILED", row: stagedPath, detail: String(e) }); return failures; }

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw); }
  catch (e) { failures.push({ rule: "PARSE_FAILED", row: stagedPath, detail: String(e) }); return failures; }

  // Safety flags
  for (const flag of ["staged_only", "not_imported_by_app", "not_production", "not_public_now", "not_import_ready"]) {
    if (parsed[flag] !== true) {
      failures.push({ rule: "MISSING_SAFETY_FLAG", row: "(top-level)", detail: `${flag} must be true (got ${JSON.stringify(parsed[flag])})` });
    }
  }

  const cards = parsed["cards"] as Array<Record<string, unknown>>;
  if (!Array.isArray(cards)) {
    failures.push({ rule: "CARDS_NOT_ARRAY", row: "(top-level)", detail: "cards must be an array" });
    return failures;
  }
  if (cards.length !== 7) {
    failures.push({ rule: "BAD_CARD_COUNT", row: "(top-level)", detail: `expected 7 cards, got ${cards.length}` });
  }

  // Per-card schema
  for (const c of cards) {
    const cid = (c["listing_id"] as string) || (c["institution_name"] as string) || "(unknown)";
    for (const k of Object.keys(c)) {
      if (!ALLOWED_CARD_FIELDS.has(k)) {
        failures.push({ rule: "DISALLOWED_FIELD", row: cid, detail: `field '${k}' not in active runtime allow-list` });
      }
    }
    for (const k of REQUIRED_CARD_FIELDS) {
      if (c[k] === undefined || c[k] === null) {
        failures.push({ rule: "MISSING_REQUIRED_FIELD", row: cid, detail: `field '${k}' missing` });
      }
    }
    const url = c["official_source_url"] as string;
    if (url && !/^https?:\/\//.test(url)) failures.push({ rule: "BAD_URL", row: cid, detail: `official_source_url not http(s):// — '${url}'` });
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

  // Original-active-5 IDs preserved verbatim. (Note: this validator was authored
  // when active runtime was exactly the original 5; later activation slices may
  // grow the active runtime by adding new cards that were never in batch-2's
  // snapshot. We therefore only assert that batch 2 STILL contains the original
  // 5 with content matching their current active form, not that it contains
  // every newly active card.)
  const activeCards = loadActiveCards(repoRoot);
  const stagedById = new Map<string, Record<string, unknown>>();
  for (const c of cards) stagedById.set(c["listing_id"] as string, c);
  const ORIGINAL_ACTIVE_IDS_AT_BATCH_2_TIME = new Set(EXPECTED_ACTIVE_IDS);
  for (const a of activeCards) {
    const aid = a["listing_id"] as string;
    if (!ORIGINAL_ACTIVE_IDS_AT_BATCH_2_TIME.has(aid)) continue;
    const s = stagedById.get(aid);
    if (!s) {
      failures.push({ rule: "ACTIVE_ID_MISSING", row: aid, detail: "active card not preserved in staged file" });
      continue;
    }
    if (JSON.stringify(s) !== JSON.stringify(a)) {
      failures.push({ rule: "ACTIVE_CARD_DRIFT", row: aid, detail: "staged copy of active card does not match active runtime" });
    }
  }
  // Expected staged IDs present
  for (const sid of EXPECTED_STAGED_IDS) {
    if (!stagedById.has(sid)) failures.push({ rule: "STAGED_ID_MISSING", row: sid, detail: `staged candidate '${sid}' not present` });
  }

  // Banned phrase + forbidden token deep scan
  deepStringWalk(parsed, (s, loc) => {
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) {
        failures.push({ rule: "BANNED_PHRASE", row: loc, detail: `banned phrase ${re}: '${s.slice(0, 100)}'` });
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

  // UPMC checks
  const upmc = cards.find(c => c["listing_id"] === "pilot-011-PA-upmc-western-psychiatric-hospital");
  if (upmc) {
    const upmcAd = upmc["audience_detail"] as Record<string, string>;
    if (upmcAd?.img_graduate !== "EXCLUDED_EXPLICIT") {
      failures.push({ rule: "UPMC_GRAD_MUST_BE_EXCLUDED", row: "pilot-011", detail: `audience_detail.img_graduate should be EXCLUDED_EXPLICIT (got '${upmcAd?.img_graduate}')` });
    }
    const tags = (upmc["restriction_tags"] || []) as string[];
    for (const t of ["LCME_AOA_ONLY", "MS4_ONLY", "FEE_REQUIRED", "VISA_APPLICANT_OBTAINED_B1", "NO_J1_SPONSORSHIP", "NO_H1B_SPONSORSHIP"]) {
      if (!tags.includes(t)) failures.push({ rule: "UPMC_TAG_MISSING", row: "pilot-011", detail: `restriction_tag '${t}' missing` });
    }
    const campus = upmc["campus_name"] as string;
    if (!/system-level/i.test(campus) || !/Western Psychiatric/i.test(campus)) {
      failures.push({ rule: "UPMC_SYSTEM_CAVEAT_MISSING_FROM_CAMPUS_NAME", row: "pilot-011", detail: `campus_name should describe system-level + Western Psychiatric site limitation (got '${campus}')` });
    }
  }
  // Lincoln checks
  const lincoln = cards.find(c => c["listing_id"] === "pilot-012-NY-nyc-health-hospitals-lincoln");
  if (lincoln) {
    const lincolnAd = lincoln["audience_detail"] as Record<string, string>;
    for (const k of ["international_student", "img_graduate", "caribbean_student"]) {
      if (lincolnAd?.[k] !== "EXCLUDED_EXPLICIT") {
        failures.push({ rule: "LINCOLN_NON_US_MUST_BE_EXCLUDED", row: "pilot-012", detail: `audience_detail.${k} should be EXCLUDED_EXPLICIT (got '${lincolnAd?.[k]}')` });
      }
    }
    const tags = (lincoln["restriction_tags"] || []) as string[];
    if (!tags.includes("LCME_AOA_ONLY")) {
      failures.push({ rule: "LINCOLN_TAG_MISSING", row: "pilot-012", detail: "restriction_tag 'LCME_AOA_ONLY' missing" });
    }
    const campus = lincoln["campus_name"] as string;
    if (!/system-level/i.test(campus) || !/Lincoln/i.test(campus)) {
      failures.push({ rule: "LINCOLN_SYSTEM_CAVEAT_MISSING_FROM_CAMPUS_NAME", row: "pilot-012", detail: `campus_name should describe system-level + Lincoln site limitation (got '${campus}')` });
    }
  }

  // Import safety: grep for any src/ TS file importing the staged module
  const stagedRel = path.relative(repoRoot, stagedPath).replace(/\\/g, "/");
  const stagedBasename = path.basename(stagedRel, ".json"); // public-listings-pilot-staged-batch-2.generated
  try {
    const grepOut = execSync(
      `grep -rln "${stagedBasename}\\|PILOT_USCE_CARDS_STAGED_BATCH_2\\|PILOT_STAGED_BATCH_2" src/ 2>/dev/null || true`,
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();
    const offenders = grepOut.split("\n").filter(line => {
      if (!line) return false;
      // The staged data file itself is allowed to "match"
      if (line.endsWith("public-listings-pilot-staged-batch-2.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-2.generated.json")) return false;
      return true;
    });
    if (offenders.length > 0) {
      failures.push({ rule: "STAGED_FILE_IS_IMPORTED", row: "(import-safety)", detail: `staged module is referenced by app source: ${offenders.join(", ")}` });
    }
  } catch { /* ignore */ }

  return failures;
}

function main() {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-staged-runtime-batch-2.ts <path-to-staged-json>");
    process.exit(2);
  }
  if (!fs.existsSync(argPath)) {
    console.error(`File not found: ${argPath}`);
    process.exit(2);
  }
  const repoRoot = path.resolve(__dirname, "..");

  console.log("=".repeat(60));
  console.log("P99-P97 Staged Runtime Batch 2 Validator");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);

  const failures = validate(argPath, repoRoot);

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Staged runtime is data-only and not imported by app.");
    console.log("  Active runtime preserved verbatim. No public promotion. No production.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
