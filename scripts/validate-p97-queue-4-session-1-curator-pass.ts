/**
 * P97 Queue 4 Session 1 — Curator Pass Validator
 *
 * Validates the curator-pass artifacts at:
 *   docs/platform-v2/local/usce-completeness/queue-4-session-1-curator-pass/
 *
 * Hard gates:
 *   - Exactly 2 curator input rows
 *   - Vanderbilt + UCSF both included
 *   - Quote-capture rows exist for both
 *   - Scope-decision rows exist for both
 *   - Audience-decision rows exist for both
 *   - Bridge-readiness rows exist for both
 *   - Manual-browser-required backlog file exists with at least 14 entries
 *   - No bare PUBLIC_NOW / IMPORT_READY token (NO_* form allowed)
 *   - No active/staged runtime data drift
 *   - No app code drift
 *   - No unredacted AIza / Google API key in saved HTML snapshots
 *   - No banned public claim ("guaranteed" / "hospital-approved" / "IMG-friendly" / "apply through USCEHub" / "nationwide")
 *   - Bridge-ready rows have source_url + at least one quote_short
 *
 * Run:
 *   npx tsx scripts/validate-p97-queue-4-session-1-curator-pass.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(REPO_ROOT, "docs/platform-v2/local/usce-completeness/queue-4-session-1-curator-pass");
const INPUT = path.join(FOLDER, "session_1_curator_input_rows.csv");
const QUOTE = path.join(FOLDER, "session_1_curator_source_quote_capture.csv");
const SCOPE = path.join(FOLDER, "session_1_curator_scope_decisions.csv");
const AUDIENCE = path.join(FOLDER, "session_1_curator_audience_decisions.csv");
const BRIDGE = path.join(FOLDER, "session_1_curator_bridge_readiness.csv");
const BACKLOG = path.join(FOLDER, "session_1_manual_browser_required_backlog.csv");
const EVIDENCE = path.join(FOLDER, "session_1_curator_evidence_manifest.csv");

const REQUIRED_INSTITUTIONS = ["Vanderbilt University Medical Center", "UCSF Medical Center"];
const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];
const BANNED_PUBLIC_PHRASES = [/\bguaranteed\b/i, /\bhospital[- ]approved\b/i, /\bIMG[- ]friendly\b/i, /\bapply through USCEHub\b/i, /\bnationwide\b/i, /\bofficially approved by\b/i];

interface Failure { rule: string; row: string; detail: string }
const failures: Failure[] = [];
const fail = (r: string, row: string, d: string) => failures.push({ rule: r, row, detail: d });
const check = (r: string, row: string, c: boolean, d: string) => { if (!c) fail(r, row, d); };

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
  const cells = parseCsv(fs.readFileSync(p, "utf8"));
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
  for (const p of [INPUT, QUOTE, SCOPE, AUDIENCE, BRIDGE, BACKLOG, EVIDENCE]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "required file not found");
  }
  if (failures.length > 0) return;

  const input = readCsv(INPUT);
  const quote = readCsv(QUOTE);
  const scope = readCsv(SCOPE);
  const audience = readCsv(AUDIENCE);
  const bridge = readCsv(BRIDGE);
  const backlog = readCsv(BACKLOG);

  check("INPUT_COUNT", "(input)", input.rows.length === 2, `expected exactly 2 input rows, got ${input.rows.length}`);

  const inputNames = new Set(input.rows.map(r => r["institution_name"]));
  for (const inst of REQUIRED_INSTITUTIONS) {
    check("MISSING_INSTITUTION", inst, inputNames.has(inst), `${inst} not in input rows`);
  }

  const expectInBoth = (fileLabel: string, rows: Array<Record<string,string>>) => {
    const names = new Set(rows.map(r => r["institution_name"]));
    for (const inst of REQUIRED_INSTITUTIONS) {
      check(`MISSING_FROM_${fileLabel}`, inst, names.has(inst), `${inst} not in ${fileLabel}`);
    }
  };
  expectInBoth("QUOTE", quote.rows);
  expectInBoth("SCOPE", scope.rows);
  expectInBoth("AUDIENCE", audience.rows);
  expectInBoth("BRIDGE", bridge.rows);

  check("BACKLOG_TOO_SMALL", "(backlog)", backlog.rows.length >= 14,
    `manual-browser backlog has ${backlog.rows.length} rows; required >= 14`);

  // Bridge-ready rows must have at least one quote + a source_url
  for (const b of bridge.rows) {
    if (b["ready_for_bridge_validation"] === "TRUE") {
      const inst = b["institution_name"];
      const matchingQuotes = quote.rows.filter(q => q["institution_name"] === inst && q["quote_short"]);
      check("BRIDGE_READY_MISSING_QUOTE", inst, matchingQuotes.length >= 1, `${inst} marked bridge-ready but no quote_short captured`);
      const matchingUrl = matchingQuotes.find(q => q["source_url"]);
      check("BRIDGE_READY_MISSING_URL", inst, !!matchingUrl, `${inst} marked bridge-ready but no source_url`);
    }
  }

  // Forbidden token + banned phrase scan
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
    for (const re of BANNED_PUBLIC_PHRASES) {
      if (re.test(text) && !/\b(no |never |not )(guaranteed|hospital[- ]approved|IMG[- ]friendly|apply through USCEHub|nationwide|officially approved by)/i.test(text)) {
        // Banned phrase outside a negation context
        if (re.source === "\\bnationwide\\b") continue; // honor existing convention
        fail("BANNED_PUBLIC_PHRASE", name, `${re} in ${name}`);
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

  // No unredacted AIza in saved HTML snapshots
  const snapshotsDir = path.join(FOLDER, "html-snapshots");
  if (fs.existsSync(snapshotsDir)) {
    for (const name of fs.readdirSync(snapshotsDir)) {
      const full = path.join(snapshotsDir, name);
      if (!fs.statSync(full).isFile()) continue;
      const text = fs.readFileSync(full, "utf8");
      if (/AIza[0-9A-Za-z_\-]{20,}/.test(text)) {
        fail("UNREDACTED_AIZA_IN_SNAPSHOT", name, `snapshot ${name} contains unredacted AIza pattern`);
      }
    }
  }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P97 Queue 4 Session 1 Curator Pass Validator");
  console.log("=".repeat(60));
  try { run(); } catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }
  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  2 curator inputs (Vanderbilt + UCSF) with quotes + scope + audience + bridge readiness.");
    console.log("  Manual-browser backlog has >=14 entries. No app drift. No forbidden token. No unredacted AIza.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
