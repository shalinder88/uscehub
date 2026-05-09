/**
 * P99 Runtime-Prep Candidate Validator
 *
 * Validates a docs-only staged candidate runtime JSON before any actual runtime generation.
 * This is for the bridge-to-runtime-prep gate, not for active runtime data.
 *
 * Run:
 *   npx tsx scripts/validate-p99-runtime-prep-candidate.ts <path-to-candidate-json>
 *
 * Hard gates:
 *   - File parses as JSON
 *   - candidate_only === true
 *   - not_imported_by_app === true
 *   - not_public_now === true
 *   - not_import_ready === true
 *   - not_production === true
 *   - candidate file path is under docs/ (not src/data/)
 *   - cards is an array of length 7 (5 active + 2 candidate)
 *   - Active 5 listing_ids preserved verbatim
 *   - 2 added candidate listing_ids match expected (pilot-011 / pilot-012)
 *   - Each card has the active runtime allow-listed fields
 *   - Each card's official_source_url is http(s)://
 *   - Each card's last_reviewed_at is ISO 8601 with Z
 *   - No banned phrase appears in any string field
 *   - No PUBLIC_NOW / IMPORT_READY token appears anywhere
 *   - For UPMC: domestic LCME/AOA + international final-year + no graduates explicit
 *   - For Lincoln: US LCME/AOA only + Caribbean/IMG/intl excluded
 *   - Evidence manifest paths exist on disk
 */

import * as fs from "fs";
import * as path from "path";

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

const EXPECTED_CANDIDATE_IDS = [
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

function validate(candidatePath: string, repoRoot: string): Failure[] {
  const failures: Failure[] = [];
  const id = (r: Record<string, unknown>): string => (r["listing_id"] as string) || (r["institution_name"] as string) || "(unknown)";

  // Path location
  const rel = path.relative(repoRoot, candidatePath).replace(/\\/g, "/");
  if (!rel.startsWith("docs/")) {
    failures.push({ rule: "BAD_LOCATION", row: rel, detail: `Candidate file must live under docs/ — got '${rel}'` });
  }
  if (rel.startsWith("src/")) {
    failures.push({ rule: "FORBIDDEN_LOCATION", row: rel, detail: `Candidate file must NOT live under src/ — got '${rel}'` });
  }

  let raw: string;
  try { raw = fs.readFileSync(candidatePath, "utf8"); }
  catch (e) { failures.push({ rule: "READ_FAILED", row: rel, detail: String(e) }); return failures; }

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(raw); }
  catch (e) { failures.push({ rule: "PARSE_FAILED", row: rel, detail: String(e) }); return failures; }

  for (const flag of ["candidate_only", "not_imported_by_app", "not_public_now", "not_import_ready", "not_production"]) {
    if (parsed[flag] !== true) {
      failures.push({ rule: "MISSING_SAFETY_FLAG", row: rel, detail: `${flag} must be true (got ${JSON.stringify(parsed[flag])})` });
    }
  }

  const cards = parsed["cards"] as Array<Record<string, unknown>>;
  if (!Array.isArray(cards)) {
    failures.push({ rule: "CARDS_NOT_ARRAY", row: rel, detail: "cards must be an array" });
    return failures;
  }
  if (cards.length !== 7) {
    failures.push({ rule: "BAD_CARD_COUNT", row: rel, detail: `expected 7 cards, got ${cards.length}` });
  }

  const seenIds = new Set<string>();
  for (const c of cards) {
    const cid = id(c);
    if (seenIds.has(cid)) failures.push({ rule: "DUPLICATE_ID", row: cid, detail: "duplicate listing_id" });
    seenIds.add(cid);

    // allow-list
    for (const k of Object.keys(c)) {
      if (!ALLOWED_CARD_FIELDS.has(k)) {
        failures.push({ rule: "DISALLOWED_FIELD", row: cid, detail: `field '${k}' not in active runtime allow-list` });
      }
    }
    // required
    for (const k of REQUIRED_CARD_FIELDS) {
      if (c[k] === undefined || c[k] === null) {
        failures.push({ rule: "MISSING_REQUIRED_FIELD", row: cid, detail: `field '${k}' missing` });
      }
    }
    // URL
    const url = c["official_source_url"] as string;
    if (url && !/^https?:\/\//.test(url)) failures.push({ rule: "BAD_URL", row: cid, detail: `official_source_url not http(s):// — '${url}'` });
    // last_reviewed_at ISO 8601 with Z
    const lr = c["last_reviewed_at"] as string;
    if (lr && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(lr)) {
      failures.push({ rule: "BAD_LAST_REVIEWED_AT", row: cid, detail: `last_reviewed_at not ISO-Z — '${lr}'` });
    }
    // audience_detail 4 keys
    const ad = c["audience_detail"] as Record<string, string> | undefined;
    if (!ad || typeof ad !== "object") {
      failures.push({ rule: "BAD_AUDIENCE_DETAIL", row: cid, detail: "audience_detail missing or wrong type" });
    } else {
      for (const k of ["us_md_do", "international_student", "img_graduate", "caribbean_student"]) {
        if (!(k in ad)) failures.push({ rule: "AUDIENCE_DETAIL_MISSING_KEY", row: cid, detail: `key '${k}' missing` });
      }
    }
  }

  // Active 5 + candidate 2 set membership
  const allIds = cards.map(c => c["listing_id"] as string);
  for (const a of EXPECTED_ACTIVE_IDS) {
    if (!allIds.includes(a)) failures.push({ rule: "ACTIVE_ID_MISSING", row: a, detail: `active card '${a}' not preserved` });
  }
  for (const cid of EXPECTED_CANDIDATE_IDS) {
    if (!allIds.includes(cid)) failures.push({ rule: "CANDIDATE_ID_MISSING", row: cid, detail: `candidate card '${cid}' not present` });
  }

  // Banned phrase + forbidden token scan, deep
  deepStringWalk(parsed, (s, loc) => {
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) {
        // Allow the regex tokens themselves only inside must_not_claim-like rationale fields. Candidate JSON has none of those by design.
        failures.push({ rule: "BANNED_PHRASE", row: loc, detail: `banned phrase matched ${re}: '${s.slice(0, 100)}'` });
        return;
      }
    }
    for (const tok of FORBIDDEN_TOKENS) {
      if (s.includes(tok) && !s.includes(`NO_${tok}`) && !/^not_(public_now|import_ready)$/.test(loc)) {
        // not_public_now/not_import_ready keys themselves are safe
        failures.push({ rule: "FORBIDDEN_TOKEN", row: loc, detail: `forbidden token '${tok}' in '${s.slice(0, 80)}'` });
        return;
      }
    }
  });

  // UPMC-specific checks
  const upmc = cards.find(c => c["listing_id"] === "pilot-011-PA-upmc-western-psychiatric-hospital");
  if (upmc) {
    const upmcAd = upmc["audience_detail"] as Record<string, string>;
    if (upmcAd?.img_graduate !== "EXCLUDED_EXPLICIT") {
      failures.push({ rule: "UPMC_GRAD_MUST_BE_EXCLUDED", row: "pilot-011", detail: `audience_detail.img_graduate should be EXCLUDED_EXPLICIT (got '${upmcAd?.img_graduate}')` });
    }
    const upmcTags = (upmc["restriction_tags"] || []) as string[];
    const expectedUpmcTags = ["LCME_AOA_ONLY", "MS4_ONLY", "FEE_REQUIRED", "VISA_APPLICANT_OBTAINED_B1", "NO_J1_SPONSORSHIP", "NO_H1B_SPONSORSHIP"];
    for (const t of expectedUpmcTags) {
      if (!upmcTags.includes(t)) failures.push({ rule: "UPMC_TAG_MISSING", row: "pilot-011", detail: `expected restriction_tag '${t}' missing` });
    }
  }

  // Lincoln-specific checks
  const lincoln = cards.find(c => c["listing_id"] === "pilot-012-NY-nyc-health-hospitals-lincoln");
  if (lincoln) {
    const lincolnAd = lincoln["audience_detail"] as Record<string, string>;
    for (const k of ["international_student", "img_graduate", "caribbean_student"]) {
      if (lincolnAd?.[k] !== "EXCLUDED_EXPLICIT") {
        failures.push({ rule: "LINCOLN_NON_US_MUST_BE_EXCLUDED", row: "pilot-012", detail: `audience_detail.${k} should be EXCLUDED_EXPLICIT (got '${lincolnAd?.[k]}')` });
      }
    }
    const lincolnTags = (lincoln["restriction_tags"] || []) as string[];
    if (!lincolnTags.includes("LCME_AOA_ONLY")) {
      failures.push({ rule: "LINCOLN_TAG_MISSING", row: "pilot-012", detail: "expected restriction_tag 'LCME_AOA_ONLY' missing" });
    }
  }

  // Evidence manifest paths exist on disk
  const manifestPath = path.join(repoRoot, "docs/platform-v2/local/usce-completeness/bridge-to-runtime-prep-batch-2/bridge_to_runtime_prep_batch_2_source_evidence_manifest.csv");
  if (!fs.existsSync(manifestPath)) {
    failures.push({ rule: "EVIDENCE_MANIFEST_MISSING", row: rel, detail: `evidence manifest CSV not found at ${manifestPath}` });
  } else {
    const mtxt = fs.readFileSync(manifestPath, "utf8");
    const pngLines = mtxt.split("\n").filter(l => l.includes(".png"));
    for (const line of pngLines) {
      const match = line.match(/(docs\/[^,"\s]+\.png)/);
      if (match) {
        const pngPath = path.join(repoRoot, match[1]);
        if (!fs.existsSync(pngPath)) {
          failures.push({ rule: "EVIDENCE_PNG_NOT_ON_DISK", row: match[1], detail: `referenced PNG does not exist on disk` });
        }
      }
    }
  }

  return failures;
}

function main() {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-runtime-prep-candidate.ts <path-to-candidate-json>");
    process.exit(2);
  }
  if (!fs.existsSync(argPath)) {
    console.error(`File not found: ${argPath}`);
    process.exit(2);
  }

  const repoRoot = path.resolve(__dirname, "..");

  console.log("=".repeat(60));
  console.log("P99 Runtime-Prep Candidate Validator (docs-only)");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);

  const failures = validate(argPath, repoRoot);

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Candidate runtime is docs-only and schema-safe.");
    console.log("  No active runtime mutation. No public promotion. No import. No production.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
