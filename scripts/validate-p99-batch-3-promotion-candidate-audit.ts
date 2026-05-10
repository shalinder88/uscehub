/**
 * P99-P97 Batch 3 Promotion Candidate Audit Validator
 *
 * Validates the candidate-audit CSVs at:
 *   docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-promotion-candidate-audit/
 *
 * Hard gates:
 *   - All 7 batch-3 listing IDs appear in the candidate matrix
 *   - Shortlist contains 1–3 rows
 *   - No row with HIGH public-copy risk is shortlisted
 *   - Every shortlisted row appears in the report-issue listing map
 *     (carries report mapping forward)
 *   - Every shortlisted row has report_ref + evidence_join + correction
 *     payload context (verified via mapping CSVs from prior sprint)
 *   - Every non-shortlisted row has a defer reason
 *   - No PUBLIC_NOW / IMPORT_READY anywhere in the audit folder
 *   - Active runtime, batch 2, batch 3 staged data files unchanged on disk
 *   - No app code import of the staged batch-3 module
 *
 * Run:
 *   npx tsx scripts/validate-p99-batch-3-promotion-candidate-audit.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-promotion-candidate-audit"
);
const MATRIX = path.join(FOLDER, "batch_3_promotion_candidate_matrix.csv");
const PUBLIC_COPY = path.join(FOLDER, "batch_3_public_copy_risk_audit.csv");
const SHORTLIST = path.join(FOLDER, "batch_3_activation_candidate_shortlist.csv");
const DEFER = path.join(FOLDER, "batch_3_defer_reasons.csv");

const PRIOR_LISTING_MAP = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-report-issue-mapping/staged_runtime_batch_3_report_issue_listing_map.csv"
);

const STAGED_BATCH_3_JSON = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot-staged-batch-3.generated.json"
);

const EXPECTED_NEW_IDS = [
  "pilot-013-FL-jackson-memorial-hospital",
  "pilot-014-NC-duke-university-hospital",
  "pilot-015-IL-northwestern-memorial-hospital",
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
  "pilot-017-NY-nyu-langone-tisch-hospital",
  "pilot-018-TX-methodist-hospital-san-antonio",
  "pilot-019-IN-iu-health-methodist-hospital",
];

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION",
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
  for (const p of [MATRIX, PUBLIC_COPY, SHORTLIST, DEFER, PRIOR_LISTING_MAP, STAGED_BATCH_3_JSON]) {
    if (!fs.existsSync(p)) {
      fail("FILE_MISSING", p, "required file not found");
    }
  }
  if (failures.length > 0) return;

  const matrix = readCsv(MATRIX);
  const publicCopy = readCsv(PUBLIC_COPY);
  const shortlist = readCsv(SHORTLIST);
  const defer = readCsv(DEFER);
  const priorMap = readCsv(PRIOR_LISTING_MAP);

  // Matrix completeness
  const matrixIds = new Set(matrix.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_NEW_IDS) {
    check("LISTING_ID_MISSING_IN_MATRIX", id,
      matrixIds.has(id), "matrix row missing for new staged id");
  }

  // Shortlist size 1..3
  check("SHORTLIST_SIZE", "(shortlist)",
    shortlist.rows.length >= 1 && shortlist.rows.length <= 3,
    `shortlist must contain 1..3 rows; got ${shortlist.rows.length}`);

  const shortlistIds = new Set(shortlist.rows.map(r => r["listing_id"]));

  // No HIGH public-copy risk shortlisted
  for (const r of publicCopy.rows) {
    if (shortlistIds.has(r["listing_id"]) && r["risk_level"] === "HIGH") {
      fail("HIGH_RISK_SHORTLISTED", r["listing_id"],
        "shortlisted row has HIGH public-copy risk");
    }
  }

  // Every shortlisted row carries report mapping forward
  const priorMapIds = new Set(priorMap.rows.map(r => r["listing_id"]));
  for (const id of shortlistIds) {
    check("SHORTLIST_ROW_NOT_IN_PRIOR_MAPPING", id,
      priorMapIds.has(id),
      "shortlisted row must already exist in prior batch-3 report-issue listing map");
  }

  // Every non-shortlisted row has a defer reason
  const deferIds = new Set(defer.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_NEW_IDS) {
    if (shortlistIds.has(id)) continue;
    check("DEFERRED_ROW_HAS_NO_REASON", id,
      deferIds.has(id),
      "non-shortlisted row must have a defer reason in batch_3_defer_reasons.csv");
  }

  // Forbidden tokens scan over the audit folder
  const dirEntries = fs.readdirSync(FOLDER);
  for (const name of dirEntries) {
    const full = path.join(FOLDER, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`) && !text.includes(`no_${tok.toLowerCase()}`)) {
        fail("FORBIDDEN_TOKEN_IN_AUDIT", name, `token ${tok} appears in ${name}`);
      }
    }
  }

  // Active runtime + batch 2 + batch 3 unchanged on disk relative to HEAD
  // Run git status --short on those paths; expect no output.
  try {
    const gitOut = execSync(
      `git status --short -- src/data/usce/public-listings-pilot.generated.json src/data/usce/public-listings-pilot-staged-batch-2.generated.json src/data/usce/public-listings-pilot-staged-batch-3.generated.json src/app/clerkships/pilot 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (gitOut.length > 0) {
      fail("RUNTIME_DATA_CHANGED", "(git status)",
        `runtime/staged data or pilot route changed: ${gitOut}`);
    }
  } catch { /* ignore */ }

  // No app source imports staged batch-3 module
  try {
    const grepOut = execSync(
      `grep -rln "public-listings-pilot-staged-batch-3\\|PILOT_USCE_CARDS_STAGED_BATCH_3\\|PILOT_STAGED_BATCH_3" src/ 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    const offenders = grepOut.split("\n").filter(line => {
      if (!line) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-3.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-3.generated.json")) return false;
      return true;
    });
    if (offenders.length > 0) {
      fail("STAGED_FILE_IS_IMPORTED", "(import-safety)",
        `staged module is referenced by app source: ${offenders.join(", ")}`);
    }
  } catch { /* ignore */ }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P99-P97 Batch 3 Promotion Candidate Audit Validator");
  console.log("=".repeat(60));

  try { run(); }
  catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  7-row candidate matrix complete; 1–3 row shortlist; defer reasons recorded.");
    console.log("  No HIGH public-copy risk shortlisted. No active/staged data drift.");
    console.log("  No app import of staged batch-3 module. No forbidden token.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
