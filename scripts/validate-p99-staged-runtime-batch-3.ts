/**
 * P99-P97 Staged Runtime Batch 3 Validator
 *
 * Validates the staged-data-only runtime artifact at:
 *   src/data/usce/public-listings-pilot-staged-batch-3.generated.json
 *
 * Hard gates:
 *   - File parses as JSON
 *   - Top-level safety flags all true (staged_only, not_imported_by_app,
 *     not_production, not_public_now, not_import_ready)
 *   - Exactly 14 cards
 *   - Active 5 listing_ids preserved verbatim AND active card content unchanged
 *   - Prior staged 2 (UPMC + Lincoln) preserved verbatim from batch 2
 *   - 7 new staged candidate listing_ids match expected (pilot-013 .. pilot-019)
 *   - Each card uses only the active runtime allow-list of fields
 *   - URLs http(s)://, last_reviewed_at ISO-Z
 *   - audience_detail has all 4 required keys
 *   - No banned phrase in any string field
 *   - No PUBLIC_NOW / IMPORT_READY token
 *   - System-level placement caveat present (campus_name) where applicable
 *   - Each new card has US-only audience: us_md_do=ELIGIBLE_EXPLICIT, three
 *     non-US audiences=EXCLUDED_EXPLICIT, LCME_AOA_ONLY tag present
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

const EXPECTED_PRIOR_STAGED_IDS = [
  "pilot-011-PA-upmc-western-psychiatric-hospital",
  "pilot-012-NY-nyc-health-hospitals-lincoln",
];

const EXPECTED_NEW_IDS = [
  "pilot-013-FL-jackson-memorial-hospital",
  "pilot-014-NC-duke-university-hospital",
  "pilot-015-IL-northwestern-memorial-hospital",
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
  "pilot-017-NY-nyu-langone-tisch-hospital",
  "pilot-018-TX-methodist-hospital-san-antonio",
  "pilot-019-IN-iu-health-methodist-hospital",
];

const NEW_ID_TO_SITE_NAME: Record<string, string> = {
  "pilot-013-FL-jackson-memorial-hospital": "Jackson Memorial",
  "pilot-015-IL-northwestern-memorial-hospital": "Northwestern Memorial",
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania": "HUP",
  "pilot-018-TX-methodist-hospital-san-antonio": "Methodist San Antonio",
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

function deepStringWalk(
  obj: unknown,
  cb: (s: string, location: string) => void,
  location = ""
): void {
  if (typeof obj === "string") { cb(obj, location); return; }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => deepStringWalk(v, cb, `${location}[${i}]`));
    return;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      deepStringWalk(v, cb, location ? `${location}.${k}` : k);
    }
  }
}

function loadCards(p: string): Array<Record<string, unknown>> {
  const txt = fs.readFileSync(p, "utf8");
  const parsed = JSON.parse(txt);
  return parsed.cards as Array<Record<string, unknown>>;
}

function validate(stagedPath: string, repoRoot: string): Failure[] {
  const failures: Failure[] = [];

  let raw: string;
  try { raw = fs.readFileSync(stagedPath, "utf8"); }
  catch (e) {
    failures.push({ rule: "READ_FAILED", row: stagedPath, detail: String(e) });
    return failures;
  }

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw); }
  catch (e) {
    failures.push({ rule: "PARSE_FAILED", row: stagedPath, detail: String(e) });
    return failures;
  }

  for (const flag of [
    "staged_only", "not_imported_by_app", "not_production",
    "not_public_now", "not_import_ready",
  ]) {
    if (parsed[flag] !== true) {
      failures.push({
        rule: "MISSING_SAFETY_FLAG",
        row: "(top-level)",
        detail: `${flag} must be true (got ${JSON.stringify(parsed[flag])})`,
      });
    }
  }

  const cards = parsed["cards"] as Array<Record<string, unknown>>;
  if (!Array.isArray(cards)) {
    failures.push({
      rule: "CARDS_NOT_ARRAY", row: "(top-level)", detail: "cards must be an array",
    });
    return failures;
  }
  if (cards.length !== 14) {
    failures.push({
      rule: "BAD_CARD_COUNT", row: "(top-level)",
      detail: `expected 14 cards, got ${cards.length}`,
    });
  }

  const seenIds = new Set<string>();
  for (const c of cards) {
    const cid = (c["listing_id"] as string) || (c["institution_name"] as string) || "(unknown)";
    if (seenIds.has(cid)) {
      failures.push({ rule: "DUPLICATE_LISTING_ID", row: cid, detail: "duplicate listing_id" });
    }
    seenIds.add(cid);

    for (const k of Object.keys(c)) {
      if (!ALLOWED_CARD_FIELDS.has(k)) {
        failures.push({
          rule: "DISALLOWED_FIELD", row: cid,
          detail: `field '${k}' not in active runtime allow-list`,
        });
      }
    }
    for (const k of REQUIRED_CARD_FIELDS) {
      if (c[k] === undefined || c[k] === null) {
        failures.push({
          rule: "MISSING_REQUIRED_FIELD", row: cid, detail: `field '${k}' missing`,
        });
      }
    }
    const url = c["official_source_url"] as string;
    if (url && !/^https?:\/\//.test(url)) {
      failures.push({
        rule: "BAD_URL", row: cid,
        detail: `official_source_url not http(s):// — '${url}'`,
      });
    }
    const lr = c["last_reviewed_at"] as string;
    if (lr && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(lr)) {
      failures.push({
        rule: "BAD_LAST_REVIEWED_AT", row: cid,
        detail: `last_reviewed_at not ISO-Z — '${lr}'`,
      });
    }
    const ad = c["audience_detail"] as Record<string, string> | undefined;
    if (!ad || typeof ad !== "object") {
      failures.push({
        rule: "BAD_AUDIENCE_DETAIL", row: cid,
        detail: "audience_detail missing or wrong type",
      });
    } else {
      for (const k of ["us_md_do", "international_student", "img_graduate", "caribbean_student"]) {
        if (!(k in ad)) {
          failures.push({
            rule: "AUDIENCE_DETAIL_MISSING_KEY", row: cid, detail: `key '${k}' missing`,
          });
        }
      }
    }
  }

  // Active 5 IDs preserved AND content matches active runtime
  const activeCards = loadCards(
    path.join(repoRoot, "src/data/usce/public-listings-pilot.generated.json")
  );
  const stagedById = new Map<string, Record<string, unknown>>();
  for (const c of cards) stagedById.set(c["listing_id"] as string, c);
  for (const a of activeCards) {
    const aid = a["listing_id"] as string;
    const s = stagedById.get(aid);
    if (!s) {
      failures.push({
        rule: "ACTIVE_ID_MISSING", row: aid,
        detail: "active card not preserved in staged file",
      });
      continue;
    }
    if (JSON.stringify(s) !== JSON.stringify(a)) {
      failures.push({
        rule: "ACTIVE_CARD_DRIFT", row: aid,
        detail: "staged copy of active card does not match active runtime",
      });
    }
  }

  // Prior staged 2 IDs preserved AND content matches batch 2
  const batch2Cards = loadCards(
    path.join(repoRoot, "src/data/usce/public-listings-pilot-staged-batch-2.generated.json")
  );
  const b2ById = new Map<string, Record<string, unknown>>();
  for (const c of batch2Cards) b2ById.set(c["listing_id"] as string, c);
  for (const pid of EXPECTED_PRIOR_STAGED_IDS) {
    const s = stagedById.get(pid);
    const b = b2ById.get(pid);
    if (!s) {
      failures.push({
        rule: "PRIOR_STAGED_ID_MISSING", row: pid,
        detail: "prior staged candidate not present",
      });
      continue;
    }
    if (!b) {
      failures.push({
        rule: "PRIOR_STAGED_NOT_IN_BATCH_2", row: pid,
        detail: "expected prior staged ID not found in batch 2",
      });
      continue;
    }
    if (JSON.stringify(s) !== JSON.stringify(b)) {
      failures.push({
        rule: "PRIOR_STAGED_CARD_DRIFT", row: pid,
        detail: "staged copy of prior batch-2 card does not match batch 2",
      });
    }
  }

  // Expected new 7 IDs present
  for (const nid of EXPECTED_NEW_IDS) {
    if (!stagedById.has(nid)) {
      failures.push({
        rule: "NEW_STAGED_ID_MISSING", row: nid,
        detail: `new staged candidate '${nid}' not present`,
      });
    }
  }

  // Banned phrase + forbidden token deep scan
  deepStringWalk(parsed, (s, loc) => {
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) {
        failures.push({
          rule: "BANNED_PHRASE", row: loc,
          detail: `banned phrase ${re}: '${s.slice(0, 100)}'`,
        });
        return;
      }
    }
    for (const tok of FORBIDDEN_TOKENS) {
      if (
        s.includes(tok) &&
        !s.includes(`NO_${tok}`) &&
        !/^not_(public_now|import_ready)$/.test(loc)
      ) {
        failures.push({
          rule: "FORBIDDEN_TOKEN", row: loc,
          detail: `forbidden token '${tok}' in '${s.slice(0, 80)}'`,
        });
        return;
      }
    }
  });

  // New 7: per-row US-only audience invariant + LCME_AOA_ONLY tag
  for (const nid of EXPECTED_NEW_IDS) {
    const c = stagedById.get(nid);
    if (!c) continue;
    const ad = c["audience_detail"] as Record<string, string> | undefined;
    if (!ad) continue;
    if (ad.us_md_do !== "ELIGIBLE_EXPLICIT") {
      failures.push({
        rule: "NEW_ROW_US_MD_DO_MUST_BE_ELIGIBLE", row: nid,
        detail: `audience_detail.us_md_do should be ELIGIBLE_EXPLICIT (got '${ad.us_md_do}')`,
      });
    }
    for (const k of ["international_student", "img_graduate", "caribbean_student"]) {
      if (ad[k] !== "EXCLUDED_EXPLICIT") {
        failures.push({
          rule: "NEW_ROW_NON_US_MUST_BE_EXCLUDED", row: nid,
          detail: `audience_detail.${k} should be EXCLUDED_EXPLICIT (got '${ad[k]}')`,
        });
      }
    }
    const tags = (c["restriction_tags"] || []) as string[];
    if (!tags.includes("LCME_AOA_ONLY")) {
      failures.push({
        rule: "NEW_ROW_TAG_MISSING", row: nid,
        detail: "restriction_tag 'LCME_AOA_ONLY' missing",
      });
    }
    const display = c["display_bucket"] as string;
    if (display !== "READY_PUBLIC_US_STUDENT_ONLY") {
      failures.push({
        rule: "NEW_ROW_DISPLAY_BUCKET_MUST_BE_US_ONLY", row: nid,
        detail: `display_bucket should be READY_PUBLIC_US_STUDENT_ONLY (got '${display}')`,
      });
    }
  }

  // System-level caveat present on system-page sources where applicable
  for (const [nid, siteName] of Object.entries(NEW_ID_TO_SITE_NAME)) {
    const c = stagedById.get(nid);
    if (!c) continue;
    const campus = (c["campus_name"] as string) || "";
    if (!/system-level/i.test(campus)) {
      failures.push({
        rule: "SYSTEM_CAVEAT_MISSING_FROM_CAMPUS_NAME", row: nid,
        detail: `campus_name should describe system-level + ${siteName} site limitation (got '${campus}')`,
      });
    }
  }

  // Import safety: grep for any src/ TS file importing the staged module
  const stagedRel = path.relative(repoRoot, stagedPath).replace(/\\/g, "/");
  const stagedBasename = path.basename(stagedRel, ".json");
  try {
    const grepOut = execSync(
      `grep -rln "${stagedBasename}\\|PILOT_USCE_CARDS_STAGED_BATCH_3\\|PILOT_STAGED_BATCH_3" src/ 2>/dev/null || true`,
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();
    const offenders = grepOut.split("\n").filter((line) => {
      if (!line) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-3.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-3.generated.json")) return false;
      return true;
    });
    if (offenders.length > 0) {
      failures.push({
        rule: "STAGED_FILE_IS_IMPORTED", row: "(import-safety)",
        detail: `staged module is referenced by app source: ${offenders.join(", ")}`,
      });
    }
  } catch { /* ignore */ }

  return failures;
}

function main(): void {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-staged-runtime-batch-3.ts <path-to-staged-json>");
    process.exit(2);
  }
  if (!fs.existsSync(argPath)) {
    console.error(`File not found: ${argPath}`);
    process.exit(2);
  }
  const repoRoot = path.resolve(__dirname, "..");

  console.log("=".repeat(60));
  console.log("P99-P97 Staged Runtime Batch 3 Validator");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);

  const failures = validate(argPath, repoRoot);

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Staged runtime batch 3 is data-only and not imported by app.");
    console.log("  Active runtime preserved verbatim. Prior staged 2 preserved verbatim.");
    console.log("  7 new validated rows present. No public promotion. No production.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
