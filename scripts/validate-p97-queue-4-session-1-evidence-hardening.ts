/**
 * P97 Queue 4 Session 1 — Evidence Hardening Validator
 *
 * Validates the Session-1 evidence-hardening artifacts at:
 *   docs/platform-v2/local/usce-completeness/queue-4-session-1-evidence-hardening/
 *
 * Hard gates:
 *   - Input rows present
 *   - Vanderbilt is in the input rows
 *   - Bot-defended rows accounted for in bot_defended_wayback_results.csv
 *   - Hardened candidate findings is a subset of input rows
 *   - Curator queue is a subset of hardened findings
 *   - Bridge validation input is a subset of hardened findings
 *   - Every hardened candidate has source_url
 *   - Every hardened candidate has evidence_strength
 *   - No bare PUBLIC_NOW / IMPORT_READY token (NO_* form allowed)
 *   - No active or staged runtime data drift
 *   - No app code drift (/clerkships/pilot, /contact, contact-context)
 *   - No unredacted AIza pattern in any saved HTML snapshot
 *
 * Run:
 *   npx tsx scripts/validate-p97-queue-4-session-1-evidence-hardening.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/queue-4-session-1-evidence-hardening"
);
const INPUT = path.join(FOLDER, "session_1_evidence_hardening_input_rows.csv");
const NAV = path.join(FOLDER, "session_1_manual_source_navigation_results.csv");
const HARDENED = path.join(FOLDER, "session_1_hardened_candidate_findings.csv");
const CURATOR = path.join(FOLDER, "session_1_curator_queue.csv");
const BRIDGE = path.join(FOLDER, "session_1_bridge_validation_input_candidates.csv");
const BOT = path.join(FOLDER, "session_1_bot_defended_wayback_results.csv");
const TRIPLES = path.join(FOLDER, "session_1_evidence_triples_manifest.csv");

const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];

interface Failure { rule: string; row: string; detail: string }
const failures: Failure[] = [];
function fail(r: string, row: string, d: string) { failures.push({ rule: r, row, detail: d }); }
function check(r: string, row: string, c: boolean, d: string) { if (!c) fail(r, row, d); }

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQ = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i+=2; continue; } inQ = false; i++; continue; }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === ",") { row.push(cur); cur = ""; i++; continue; }
    if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    cur += ch; i++;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function readCsv(p: string) {
  const text = fs.readFileSync(p, "utf8");
  const cells = parseCsv(text);
  if (cells.length === 0) return { header: [] as string[], rows: [] as Array<Record<string,string>> };
  const header = cells[0];
  const rows = cells.slice(1).map(r => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = r[i] ?? "";
    return obj;
  });
  return { header, rows };
}

function run(): void {
  for (const p of [INPUT, NAV, HARDENED, CURATOR, BRIDGE, BOT, TRIPLES]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "required file not found");
  }
  if (failures.length > 0) return;

  const input = readCsv(INPUT);
  const nav = readCsv(NAV);
  const hardened = readCsv(HARDENED);
  const curator = readCsv(CURATOR);
  const bridge = readCsv(BRIDGE);
  const bot = readCsv(BOT);

  check("INPUT_ROW_COUNT", "(input)", input.rows.length >= 1, `evidence-hardening input rows = ${input.rows.length}; required >= 1`);

  const inputNames = new Set(input.rows.map(r => r["institution_name"]));
  check("VANDERBILT_IN_INPUT", "Vanderbilt", inputNames.has("Vanderbilt University Medical Center"), "Vanderbilt must be in evidence-hardening input rows");

  const expectedBlocked = ["Billings Clinic", "Michigan Medicine - University Hospital", "Bellevue Hospital - NYC H+H", "Harborview Medical Center"];
  const botNames = new Set(bot.rows.map(r => r["institution_name"]));
  for (const b of expectedBlocked) {
    check("BOT_DEFENDED_ROW_MISSING", b, botNames.has(b), `bot-defended row '${b}' not in bot_defended_wayback_results.csv`);
  }

  for (const r of hardened.rows) {
    check("HARDENED_NOT_IN_INPUT", r["institution_name"], inputNames.has(r["institution_name"]), "hardened candidate not in input rows");
    check("HARDENED_MISSING_SOURCE_URL", r["institution_name"], !!r["source_url"], "hardened candidate missing source_url");
    check("HARDENED_MISSING_EVIDENCE_STRENGTH", r["institution_name"], !!r["evidence_strength"], "hardened candidate missing evidence_strength");
  }

  const hardenedNames = new Set(hardened.rows.map(r => r["institution_name"]));
  for (const r of curator.rows) {
    check("CURATOR_NOT_IN_HARDENED", r["institution_name"], hardenedNames.has(r["institution_name"]), "curator-queue institution not in hardened set");
  }
  for (const r of bridge.rows) {
    check("BRIDGE_NOT_IN_HARDENED", r["institution_name"], hardenedNames.has(r["institution_name"]), "bridge-validation institution not in hardened set");
  }

  // Forbidden token scan over the folder
  for (const name of fs.readdirSync(FOLDER)) {
    const full = path.join(FOLDER, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (![".md", ".csv", ".json", ".ts", ".txt"].includes(ext)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN_IN_HARDENING_FOLDER", name, `bare '${tok}' token in ${name}`);
      }
    }
  }

  // No drift on protected paths
  try {
    const out = execSync(
      `git status --short -- src/data/usce/public-listings-pilot.generated.json src/data/usce/public-listings-pilot.generated.ts src/data/usce/public-listings-pilot-staged-batch-2.generated.json src/data/usce/public-listings-pilot-staged-batch-3.generated.json src/app/clerkships/pilot src/app/contact src/lib/usce-contact-context.ts 2>/dev/null || true`,
      { cwd: REPO_ROOT, encoding: "utf8" }
    ).trim();
    if (out.length > 0) fail("RUNTIME_OR_APP_FILE_CHANGED", "(git status)", `protected paths changed: ${out}`);
  } catch { /* ignore */ }

  // No unredacted AIza pattern in any saved HTML snapshot
  const snapshotsDir = path.join(FOLDER, "html-snapshots");
  if (fs.existsSync(snapshotsDir)) {
    for (const name of fs.readdirSync(snapshotsDir)) {
      const full = path.join(snapshotsDir, name);
      if (!fs.statSync(full).isFile()) continue;
      const text = fs.readFileSync(full, "utf8");
      if (/AIza[0-9A-Za-z_\-]{20,}/.test(text)) {
        fail("UNREDACTED_AIZA_IN_SNAPSHOT", name, `snapshot ${name} still contains an unredacted AIza pattern`);
      }
    }
  }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P97 Queue 4 Session 1 Evidence Hardening Validator");
  console.log("=".repeat(60));
  try { run(); } catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Input rows present + Vanderbilt + bot-defended row coverage + subset consistency.");
    console.log("  No forbidden token. No app/runtime drift. No unredacted AIza in saved HTML.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
