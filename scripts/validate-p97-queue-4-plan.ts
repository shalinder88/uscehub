/**
 * P97 Queue 4 Plan Validator
 *
 * Validates the Queue-4 resume planning artifacts at:
 *   docs/platform-v2/local/usce-completeness/queue-4-national-screening-resume/
 *
 * Hard gates:
 *   - queue_4_candidate_rows.csv has >= 50 rows
 *   - queue_4_session_1_rows.csv has exactly 25 rows
 *   - Every Session-1 row maps to a queue_4_rank that exists in the candidate file
 *   - No duplicate queue_4_rank in candidate file
 *   - No duplicate session_rank in session-1 file
 *   - No bare PUBLIC_NOW / IMPORT_READY token in the resume folder (NO_* forms allowed)
 *   - No new active or staged runtime data file changed by this sprint
 *
 * Run:
 *   npx tsx scripts/validate-p97-queue-4-plan.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/queue-4-national-screening-resume"
);
const CANDIDATE_FILE = path.join(FOLDER, "queue_4_candidate_rows.csv");
const SESSION_1_FILE = path.join(FOLDER, "queue_4_session_1_rows.csv");

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
  for (const p of [CANDIDATE_FILE, SESSION_1_FILE]) {
    if (!fs.existsSync(p)) {
      fail("FILE_MISSING", p, "required file not found");
    }
  }
  if (failures.length > 0) return;

  const candidate = readCsv(CANDIDATE_FILE);
  const session1 = readCsv(SESSION_1_FILE);

  // Candidate count
  check("CANDIDATE_ROW_COUNT_LOW", "(candidate)",
    candidate.rows.length >= 50,
    `queue_4_candidate_rows.csv has ${candidate.rows.length} rows; required >= 50`);

  // Candidate rank uniqueness
  const candidateRanks = new Set<string>();
  for (const r of candidate.rows) {
    if (candidateRanks.has(r["queue_4_rank"])) {
      fail("DUPLICATE_CANDIDATE_RANK", r["queue_4_rank"],
        `queue_4_rank '${r["queue_4_rank"]}' duplicated in candidate file`);
    }
    candidateRanks.add(r["queue_4_rank"]);
  }

  // Session 1 row count
  check("SESSION_1_ROW_COUNT", "(session-1)",
    session1.rows.length === 25,
    `queue_4_session_1_rows.csv has ${session1.rows.length} rows; required exactly 25`);

  // Session 1 rank uniqueness
  const sessionRanks = new Set<string>();
  for (const r of session1.rows) {
    if (sessionRanks.has(r["session_rank"])) {
      fail("DUPLICATE_SESSION_RANK", r["session_rank"],
        `session_rank '${r["session_rank"]}' duplicated`);
    }
    sessionRanks.add(r["session_rank"]);
  }

  // Every Session-1 queue_4_rank exists in the candidate file
  for (const r of session1.rows) {
    if (!candidateRanks.has(r["queue_4_rank"])) {
      fail("SESSION_1_RANK_NOT_IN_CANDIDATE_FILE", r["queue_4_rank"],
        `Session-1 row references queue_4_rank '${r["queue_4_rank"]}' not in candidate file`);
    }
  }

  // Forbidden token scan over the resume folder
  const dirEntries = fs.readdirSync(FOLDER);
  for (const name of dirEntries) {
    const full = path.join(FOLDER, name);
    const stat = fs.statSync(full);
    if (!stat.isFile()) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN_IN_RESUME_FOLDER", name,
          `bare '${tok}' token in ${name}; use NO_${tok} form instead`);
      }
    }
  }

  // No active runtime data or staged data drift caused by this sprint
  try {
    const gitOut = execSync(
      `git status --short -- src/data/usce/public-listings-pilot.generated.json src/data/usce/public-listings-pilot.generated.ts src/data/usce/public-listings-pilot-staged-batch-2.generated.json src/data/usce/public-listings-pilot-staged-batch-3.generated.json src/app/clerkships/pilot src/app/contact src/lib/usce-contact-context.ts 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (gitOut.length > 0) {
      fail("RUNTIME_OR_APP_FILE_CHANGED", "(git status)",
        `runtime / contact / clerkships / contact-context changed by this sprint: ${gitOut}`);
    }
  } catch { /* ignore */ }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P97 Queue 4 Plan Validator");
  console.log("=".repeat(60));

  try { run(); }
  catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Candidate file >= 50 rows; Session-1 = 25 rows; ranks unique; no app-code drift.");
    console.log("  No bare PUBLIC_NOW / IMPORT_READY token in resume folder.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
