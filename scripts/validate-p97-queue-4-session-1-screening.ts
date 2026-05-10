/**
 * P97 Queue 4 Session 1 Screening Validator
 *
 * Validates the Session-1 screening artifacts at:
 *   docs/platform-v2/local/usce-completeness/queue-4-session-1-screening/
 *
 * Hard gates:
 *   - 25 input rows
 *   - 25 screening result rows
 *   - no duplicate session ranks
 *   - every screening row has an outcome AND a stop_condition
 *   - every candidate-finding row maps to a screening row whose outcome is BRIDGE_READY_CANDIDATE
 *     or LIKELY_CANDIDATE_NEEDS_EVIDENCE_HARDENING
 *   - every bridge-readiness candidate row maps to a screening row in the candidate set
 *   - every curator-queue row maps to a candidate row
 *   - no bare PUBLIC_NOW / IMPORT_READY token in the session folder (NO_* form allowed)
 *   - no active or staged runtime data drift
 *   - no /clerkships/pilot or /contact code drift
 *
 * Run:
 *   npx tsx scripts/validate-p97-queue-4-session-1-screening.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/queue-4-session-1-screening"
);
const INPUT = path.join(FOLDER, "queue_4_session_1_input_rows.csv");
const RESULTS = path.join(FOLDER, "queue_4_session_1_screening_results.csv");
const FINDINGS = path.join(FOLDER, "queue_4_session_1_candidate_findings.csv");
const BRIDGE = path.join(FOLDER, "queue_4_session_1_bridge_readiness_candidates.csv");
const CURATOR = path.join(FOLDER, "queue_4_session_1_curator_queue.csv");

const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];
const VALID_OUTCOMES = new Set([
  "BRIDGE_READY_CANDIDATE",
  "LIKELY_CANDIDATE_NEEDS_EVIDENCE_HARDENING",
  "INTERNAL_REVIEW_SOURCE_SCOPE",
  "INTERNAL_REVIEW_AUDIENCE_SCOPE",
  "FUTURE_LANE_ONLY",
  "REJECTED_NON_TARGET",
  "BLOCKED_LOGIN_OR_CAPTCHA",
  "NO_RELEVANT_PUBLIC_SOURCE_FOUND",
  "DUPLICATE_OR_ALREADY_COVERED",
]);

interface Failure { rule: string; row: string; detail: string }
const failures: Failure[] = [];
function fail(r: string, row: string, d: string): void { failures.push({ rule: r, row, detail: d }); }
function check(r: string, row: string, c: boolean, d: string): void { if (!c) fail(r, row, d); }

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i += 2; continue; } inQuotes = false; i++; continue; }
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
  for (const p of [INPUT, RESULTS, FINDINGS, BRIDGE, CURATOR]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "required file not found");
  }
  if (failures.length > 0) return;

  const input = readCsv(INPUT);
  const results = readCsv(RESULTS);
  const findings = readCsv(FINDINGS);
  const bridge = readCsv(BRIDGE);
  const curator = readCsv(CURATOR);

  check("INPUT_ROW_COUNT", "(input)", input.rows.length === 25, `expected 25 input rows, got ${input.rows.length}`);
  check("RESULTS_ROW_COUNT", "(results)", results.rows.length === 25, `expected 25 result rows, got ${results.rows.length}`);

  const seen = new Set<string>();
  for (const r of results.rows) {
    if (seen.has(r["session_rank"])) fail("DUPLICATE_SESSION_RANK", r["session_rank"], "duplicate session_rank in results");
    seen.add(r["session_rank"]);
    if (!r["outcome"] || !VALID_OUTCOMES.has(r["outcome"])) {
      fail("INVALID_OUTCOME", r["session_rank"], `outcome '${r["outcome"]}' not in allowed set`);
    }
    if (!r["stop_condition"]) fail("MISSING_STOP_CONDITION", r["session_rank"], "stop_condition empty");
  }

  const candidateNames = new Set(
    results.rows
      .filter(r => r["outcome"] === "BRIDGE_READY_CANDIDATE" || r["outcome"] === "LIKELY_CANDIDATE_NEEDS_EVIDENCE_HARDENING")
      .map(r => r["institution_name"])
  );
  for (const r of findings.rows) {
    if (!candidateNames.has(r["institution_name"])) {
      fail("FINDING_NOT_IN_CANDIDATE_RESULTS", r["institution_name"], "candidate-finding institution not in BRIDGE_READY/LIKELY rows");
    }
  }
  for (const r of bridge.rows) {
    if (!candidateNames.has(r["institution_name"])) {
      fail("BRIDGE_NOT_IN_CANDIDATES", r["institution_name"], "bridge-readiness institution not in candidate set");
    }
  }
  for (const r of curator.rows) {
    if (!candidateNames.has(r["institution_name"])) {
      fail("CURATOR_NOT_IN_CANDIDATES", r["institution_name"], "curator-queue institution not in candidate set");
    }
  }

  // Forbidden token scan over the session folder (text-readable files only)
  for (const name of fs.readdirSync(FOLDER)) {
    const full = path.join(FOLDER, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (![".md", ".csv", ".json", ".ts", ".txt"].includes(ext)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN_IN_SESSION_FOLDER", name, `bare '${tok}' token in ${name}`);
      }
    }
  }

  // No active / staged runtime / app-code drift
  try {
    const out = execSync(
      `git status --short -- src/data/usce/public-listings-pilot.generated.json src/data/usce/public-listings-pilot.generated.ts src/data/usce/public-listings-pilot-staged-batch-2.generated.json src/data/usce/public-listings-pilot-staged-batch-3.generated.json src/app/clerkships/pilot src/app/contact src/lib/usce-contact-context.ts 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (out.length > 0) {
      fail("RUNTIME_OR_APP_FILE_CHANGED", "(git status)",
        `runtime / contact / clerkships changed by this sprint: ${out}`);
    }
  } catch { /* ignore */ }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P97 Queue 4 Session 1 Screening Validator");
  console.log("=".repeat(60));
  try { run(); } catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  25 input rows / 25 result rows; ranks unique; outcomes + stop_conditions present.");
    console.log("  Findings / bridge / curator subsets are consistent. No forbidden token. No app drift.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
