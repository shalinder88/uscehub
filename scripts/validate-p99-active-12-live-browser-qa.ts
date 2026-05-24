/**
 * P99 Active-12 Live Browser QA Validator
 *
 * Validates the QA artifacts at:
 *   docs/platform-v2/local/usce-completeness/active-12-live-browser-qa/
 *
 * Hard gates:
 *   - QA folder exists with required files
 *   - Vanderbilt + UCSF rows present in card-rendering CSV and contact-report CSV
 *   - No row in card-rendering CSV has result != PASS
 *   - No row in contact-report CSV has result containing FAIL
 *   - No unresolved CRITICAL issue in known-issues CSV unless report marks sprint BLOCKED
 *   - Active runtime card count still 12 (no drift)
 *   - Staged batch-4 data file unchanged on disk
 *   - No PUBLIC_NOW / IMPORT_READY token outside NO_ form
 *   - No banned phrase in QA folder docs
 *   - No secrets pattern in QA folder docs
 *
 * Run:
 *   npx tsx scripts/validate-p99-active-12-live-browser-qa.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/active-12-live-browser-qa"
);
const MATRIX = path.join(FOLDER, "active_12_live_browser_qa_matrix.csv");
const CARDS = path.join(FOLDER, "active_12_card_rendering_qa.csv");
const CONTACT = path.join(FOLDER, "active_12_contact_report_qa.csv");
const MOBILE = path.join(FOLDER, "active_12_mobile_qa.csv");
const CONSOLE = path.join(FOLDER, "active_12_console_log_audit.csv");
const KNOWN = path.join(FOLDER, "active_12_known_issues.csv");
const REPORT = path.join(FOLDER, "P99_ACTIVE_12_LIVE_BROWSER_QA_REPORT.md");

const ACTIVE_RUNTIME_JSON = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot.generated.json"
);
const STAGED_BATCH_4_JSON = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot-staged-batch-4.generated.json"
);

const EXPECTED_IDS = [
  "pilot-020-TN-vanderbilt-university-medical-center",
  "pilot-021-CA-ucsf-medical-center",
];

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW",
  "IMPORT_READY",
  "BRIDGE_READY_TO_RUNTIME",
  "APPROVED_FOR_PUBLICATION",
];

const BANNED_PHRASES = [
  /\bguarantee[ds]?\b/i,
  /\bhospital[- ]approved\b/i,
  /\bIMG[- ]friendly\b/i,
  /\bapply through USCEHub\b/i,
];

const SECRETS_PATTERNS = [
  /\bAIza[0-9A-Za-z\-_]{35}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bgho_[A-Za-z0-9]{30,}\b/,
];

interface Failure { rule: string; row: string; detail: string }
const failures: Failure[] = [];
const fail = (r: string, row: string, d: string) => failures.push({ rule: r, row, detail: d });
const check = (r: string, row: string, c: boolean, d: string) => { if (!c) fail(r, row, d); };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        q = false; i++; continue;
      }
      cur += c; i++; continue;
    }
    if (c === '"') { q = true; i++; continue; }
    if (c === ",") { row.push(cur); cur = ""; i++; continue; }
    if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    if (c === "\r") { i++; continue; }
    cur += c; i++;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function readCsv(p: string): { header: string[]; rows: Array<Record<string, string>> } {
  const cells = parseCsv(fs.readFileSync(p, "utf8"));
  if (!cells.length) return { header: [], rows: [] };
  const header = cells[0];
  const rows = cells.slice(1).map(r => {
    const o: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) o[header[i]] = r[i] ?? "";
    return o;
  });
  return { header, rows };
}

function run(): void {
  for (const p of [FOLDER, MATRIX, CARDS, CONTACT, MOBILE, CONSOLE, KNOWN, REPORT, ACTIVE_RUNTIME_JSON, STAGED_BATCH_4_JSON]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "required path not found");
  }
  if (failures.length) return;

  const cards = readCsv(CARDS);
  const contact = readCsv(CONTACT);
  const known = readCsv(KNOWN);

  // Vanderbilt + UCSF rows present in card-rendering CSV
  const cardIds = new Set(cards.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_IDS) {
    check("MISSING_FROM_CARD_QA", id, cardIds.has(id), "expected listing missing from card rendering QA");
  }

  // No FAIL in card-rendering CSV
  for (const r of cards.rows) {
    check("CARD_QA_NOT_PASS", r["listing_id"] || "(blank)",
      r["result"] === "PASS",
      `card QA result is '${r["result"]}' (expected PASS)`);
  }

  // Contact CSV: Vanderbilt + UCSF rows present
  const contactIds = new Set(contact.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_IDS) {
    check("MISSING_FROM_CONTACT_QA", id, contactIds.has(id),
      "expected listing missing from contact QA");
  }

  // No FAIL result in contact CSV
  for (const r of contact.rows) {
    const res = r["result"] || "";
    if (/FAIL/i.test(res)) {
      fail("CONTACT_QA_FAILED", r["listing_id"] || "(blank)",
        `contact QA result is '${res}'`);
    }
  }

  // Known-issues: no unresolved CRITICAL unless report marks BLOCKED
  const reportText = fs.readFileSync(REPORT, "utf8");
  const sprintBlocked = /\bSprint status:\s*BLOCKED\b/.test(reportText);
  for (const r of known.rows) {
    const sev = (r["severity"] || "").toUpperCase();
    if (sev.startsWith("CRITICAL") && r["blocks_active_12"] === "YES" && !sprintBlocked) {
      fail("UNRESOLVED_CRITICAL_ISSUE", r["issue_id"] || "(blank)",
        "CRITICAL+blocking issue present but sprint not marked BLOCKED");
    }
  }

  // Active runtime card count still 12
  try {
    const j = JSON.parse(fs.readFileSync(ACTIVE_RUNTIME_JSON, "utf8")) as { cards: Array<{ listing_id: string }> };
    check("ACTIVE_RUNTIME_COUNT_DRIFT", "(active runtime json)",
      j.cards.length === 12, `expected 12 cards; got ${j.cards.length}`);
    for (const id of EXPECTED_IDS) {
      if (!j.cards.some(c => c.listing_id === id)) {
        fail("EXPECTED_ID_MISSING_FROM_ACTIVE_RUNTIME", id, "id missing from active runtime");
      }
    }
  } catch (e) {
    fail("ACTIVE_RUNTIME_READ_FAILED", "(active runtime json)", String(e));
  }

  // No staged batch-4 data mutation this sprint
  try {
    const gitOut = execSync(
      `git status --short -- src/data/usce/public-listings-pilot-staged-batch-4.generated.json src/data/usce/public-listings-pilot-staged-batch-4.generated.ts 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (gitOut.length) {
      fail("STAGED_BATCH_4_DRIFT", "(git status)", `staged batch-4 changed: ${gitOut}`);
    }
  } catch { /* ignore */ }

  // Forbidden tokens / banned phrases / secrets scan over QA folder text files
  for (const name of fs.readdirSync(FOLDER)) {
    const full = path.join(FOLDER, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (![".md", ".csv", ".json", ".ts", ".txt"].includes(ext)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN", name, `bare '${tok}' in ${name}`);
      }
    }
    for (const re of BANNED_PHRASES) {
      const m = text.match(re);
      if (!m) continue;
      const i = text.indexOf(m[0]);
      const ctx = text.slice(Math.max(0, i - 60), i + 80);
      // negation context tolerated (same rule as validate-micro-pilot-runtime)
      if (/\b(no |not |never )/i.test(ctx.slice(0, 60))) continue;
      fail("BANNED_PHRASE", name, `'${m[0]}' in ${name} without negation context`);
    }
    for (const re of SECRETS_PATTERNS) {
      if (re.test(text)) fail("SECRET_PATTERN", name, `secret-like token in ${name}`);
    }
  }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P99 Active-12 Live Browser QA Validator");
  console.log("=".repeat(60));

  try { run(); }
  catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  QA folder + 7 artifacts intact. Vanderbilt + UCSF rows present.");
    console.log("  Active runtime stays at 12. No staged batch-4 drift.");
    console.log("  No forbidden token / banned phrase / secret in QA docs.");
    process.exit(0);
  }

  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}

main();
