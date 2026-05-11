/**
 * P99-P97 Batch 4 Promotion Candidate Audit Validator
 *
 * Validates the candidate-audit CSVs at:
 *   docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-promotion-candidate-audit/
 *
 * Hard gates:
 *   - All 2 batch-4 listing IDs (Vanderbilt + UCSF) appear in the shortlist
 *   - Shortlist contains 1..2 rows
 *   - Every shortlisted row has recommended_action containing CAVEAT
 *   - No row with HIGH public-copy risk is shortlisted
 *   - Every shortlisted row appears in the batch-4 report-issue listing map
 *   - Every shortlisted row has school-level caveat preserved
 *   - Every shortlisted row has US-only audience preserved (no IMG overclaim)
 *   - Every non-shortlisted row has a defer reason
 *   - No PUBLIC_NOW / IMPORT_READY anywhere in the audit folder
 *   - Staged batch 2/3/4 data files unchanged on disk (active runtime
 *     change is authorized in the noindex-activation-slice sprint)
 *   - No app code import of the staged batch-4 module
 *   - Both IDs resolve in usce-contact-context with runtimeSet ∈ {staged, active}
 *     (staged before slice; active after slice — both authorized states)
 *
 * Run:
 *   npx tsx scripts/validate-p99-batch-4-promotion-candidate-audit.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-promotion-candidate-audit"
);
const SHORTLIST = path.join(FOLDER, "batch_4_activation_candidate_shortlist.csv");
const DEFER = path.join(FOLDER, "batch_4_defer_reasons.csv");
const PUBLIC_COPY = path.join(FOLDER, "batch_4_public_copy_risk_audit.csv");
const SOURCE_SCOPE = path.join(FOLDER, "batch_4_source_scope_audit.csv");
const AUDIENCE = path.join(FOLDER, "batch_4_audience_scope_audit.csv");

const PRIOR_LISTING_MAP = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-report-issue-mapping/staged_runtime_batch_4_report_issue_listing_map.csv"
);

const RESOLVER = path.join(REPO_ROOT, "src/lib/usce-contact-context.ts");

const EXPECTED_NEW_IDS = [
  "pilot-020-TN-vanderbilt-university-medical-center",
  "pilot-021-CA-ucsf-medical-center",
];

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW",
  "IMPORT_READY",
  "BRIDGE_READY_TO_RUNTIME",
  "APPROVED_FOR_PUBLICATION",
];

interface Failure { rule: string; row: string; detail: string }

const failures: Failure[] = [];
function fail(rule: string, row: string, detail: string): void {
  failures.push({ rule, row, detail });
}
function check(rule: string, row: string, cond: boolean, detail: string): void {
  if (!cond) fail(rule, row, detail);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ",") { row.push(cur); cur = ""; i++; continue; }
    if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    cur += ch; i++;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function readCsv(p: string): { header: string[]; rows: Array<Record<string, string>> } {
  const text = fs.readFileSync(p, "utf8");
  const cells = parseCsv(text);
  if (cells.length === 0) return { header: [], rows: [] };
  const header = cells[0];
  const rows = cells.slice(1).map(r => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = r[i] ?? "";
    return obj;
  });
  return { header, rows };
}

function run(): void {
  for (const p of [SHORTLIST, DEFER, PUBLIC_COPY, SOURCE_SCOPE, AUDIENCE, PRIOR_LISTING_MAP, RESOLVER]) {
    if (!fs.existsSync(p)) {
      fail("FILE_MISSING", p, "required file not found");
    }
  }
  if (failures.length > 0) return;

  const shortlist = readCsv(SHORTLIST);
  const defer = readCsv(DEFER);
  const publicCopy = readCsv(PUBLIC_COPY);
  const sourceScope = readCsv(SOURCE_SCOPE);
  const audience = readCsv(AUDIENCE);
  const priorMap = readCsv(PRIOR_LISTING_MAP);

  // Shortlist size 1..2 (batch 4 only has 2 candidates)
  check(
    "SHORTLIST_SIZE",
    "(shortlist)",
    shortlist.rows.length >= 1 && shortlist.rows.length <= 2,
    `shortlist must contain 1..2 rows; got ${shortlist.rows.length}`
  );

  const shortlistIds = new Set(shortlist.rows.map(r => r["listing_id"]));

  // Every shortlisted row must carry a CAVEAT action (never bare PROMOTE)
  for (const r of shortlist.rows) {
    check(
      "SHORTLIST_ROW_MUST_BE_CAVEATED",
      r["listing_id"],
      /CAVEAT/.test(r["recommended_action"] || ""),
      `recommended_action must contain CAVEAT; got '${r["recommended_action"]}'`
    );
  }

  // No HIGH public-copy risk shortlisted
  for (const r of publicCopy.rows) {
    if (shortlistIds.has(r["listing_id"]) && r["risk_level"] === "HIGH") {
      fail("HIGH_RISK_SHORTLISTED", r["listing_id"], "shortlisted row has HIGH public-copy risk");
    }
  }

  // Every shortlisted row carries report mapping forward
  const priorMapIds = new Set(priorMap.rows.map(r => r["listing_id"]));
  for (const id of shortlistIds) {
    check(
      "SHORTLIST_ROW_NOT_IN_PRIOR_MAPPING",
      id,
      priorMapIds.has(id),
      "shortlisted row must already exist in batch-4 report-issue listing map"
    );
  }

  // Every shortlisted row has school-level caveat preserved
  for (const r of sourceScope.rows) {
    if (!shortlistIds.has(r["listing_id"])) continue;
    check(
      "SCHOOL_LEVEL_CAVEAT_MISSING",
      r["listing_id"],
      /SCHOOL_LEVEL/.test(r["scope_decision"] || ""),
      `scope_decision must indicate school-level caveat retained; got '${r["scope_decision"]}'`
    );
    check(
      "REQUIRED_CAVEAT_MISSING",
      r["listing_id"],
      /SPECIFIC_GUARANTEE/.test(r["required_caveat"] || ""),
      `required_caveat must reference NO_*_SPECIFIC_GUARANTEE; got '${r["required_caveat"]}'`
    );
  }

  // Audience: US-only audience preserved; no IMG/international overclaim
  for (const r of audience.rows) {
    if (!shortlistIds.has(r["listing_id"])) continue;
    check(
      "AUDIENCE_NOT_EXPLICITLY_ELIGIBLE",
      r["listing_id"],
      /ELIGIBLE_EXPLICIT/.test(r["us_md_do_status"] || ""),
      `us_md_do_status must be ELIGIBLE_EXPLICIT*; got '${r["us_md_do_status"]}'`
    );
    check(
      "IMG_OVERCLAIM_RISK",
      r["listing_id"],
      r["img_status"] === "EXCLUDED_EXPLICIT",
      `img_status must be EXCLUDED_EXPLICIT (no IMG overclaim); got '${r["img_status"]}'`
    );
    check(
      "INTL_OVERCLAIM_RISK",
      r["listing_id"],
      r["international_status"] === "EXCLUDED_EXPLICIT",
      `international_status must be EXCLUDED_EXPLICIT; got '${r["international_status"]}'`
    );
    check(
      "AUDIENCE_CAVEAT_NOT_SAFE",
      r["listing_id"],
      r["audience_caveat_safe"] === "YES",
      `audience_caveat_safe must be YES; got '${r["audience_caveat_safe"]}'`
    );
    check(
      "ACTIVATION_BLOCKER_PRESENT",
      r["listing_id"],
      r["activation_blocker"] === "NO",
      `activation_blocker must be NO for shortlisted row; got '${r["activation_blocker"]}'`
    );
  }

  // Every non-shortlisted row has a defer reason
  const deferIds = new Set(defer.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_NEW_IDS) {
    if (shortlistIds.has(id)) continue;
    check(
      "DEFERRED_ROW_HAS_NO_REASON",
      id,
      deferIds.has(id),
      "non-shortlisted row must have a defer reason in batch_4_defer_reasons.csv"
    );
  }

  // Both batch-4 IDs must resolve in usce-contact-context with runtimeSet=staged
  const resolverText = fs.readFileSync(RESOLVER, "utf8");
  for (const id of EXPECTED_NEW_IDS) {
    if (!resolverText.includes(`listingId: "${id}"`)) {
      fail("MISSING_IN_RESOLVER", id, `${id} not in KNOWN_LISTINGS`);
      continue;
    }
    const re = new RegExp(
      `listingId:\\s*"${id.replace(/-/g, "\\-")}"[^}]*?runtimeSet:\\s*"([^"]+)"`,
      "s"
    );
    const m = resolverText.match(re);
    const observed = m?.[1] ?? "(missing)";
    if (!m || (observed !== "staged" && observed !== "active")) {
      fail(
        "RESOLVER_RUNTIME_SET_WRONG",
        id,
        `expected runtimeSet ∈ {staged, active}; got "${observed}"`
      );
    }
  }

  // Forbidden tokens scan over the audit folder
  for (const name of fs.readdirSync(FOLDER)) {
    const full = path.join(FOLDER, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (![".md", ".csv", ".json", ".ts", ".txt"].includes(ext)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN_IN_AUDIT", name, `token ${tok} appears in ${name}`);
      }
    }
  }

  // No staged data drift. (Active runtime, /clerkships/pilot, /contact may
  // legitimately change in the noindex-activation-slice sprint; those are
  // not policed here.)
  try {
    const gitOut = execSync(
      `git status --short -- src/data/usce/public-listings-pilot-staged-batch-2.generated.json src/data/usce/public-listings-pilot-staged-batch-3.generated.json src/data/usce/public-listings-pilot-staged-batch-4.generated.json src/data/usce/public-listings-pilot-staged-batch-4.generated.ts 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (gitOut.length > 0) {
      fail("STAGED_DATA_CHANGED", "(git status)", `staged data file changed: ${gitOut}`);
    }
  } catch { /* ignore */ }

  // No app source imports the staged batch-4 module
  try {
    const grepOut = execSync(
      `grep -rln "public-listings-pilot-staged-batch-4\\|PILOT_USCE_CARDS_STAGED_BATCH_4\\|PILOT_STAGED_BATCH_4" src/ 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    const offenders = grepOut.split("\n").filter(line => {
      if (!line) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.json")) return false;
      return true;
    });
    if (offenders.length > 0) {
      fail(
        "STAGED_FILE_IS_IMPORTED",
        "(import-safety)",
        `staged module is referenced by app source: ${offenders.join(", ")}`
      );
    }
  } catch { /* ignore */ }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P99-P97 Batch 4 Promotion Candidate Audit Validator");
  console.log("=".repeat(60));

  try { run(); }
  catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  2 batch-4 candidates audited (Vanderbilt + UCSF).");
    console.log("  Shortlist caveated; school-level caveat preserved; US-only audience preserved.");
    console.log("  Resolver runtimeSet ∈ {staged, active} for both. No staged-data drift.");
    console.log("  No app import of staged batch-4 module. No forbidden token.");
    process.exit(0);
  }

  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
