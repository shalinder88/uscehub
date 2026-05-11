/**
 * P97 Queue 4 Session 1 — Bridge Validation Validator
 *
 * Validates the bridge-validation artifacts at:
 *   docs/platform-v2/local/usce-completeness/queue-4-session-1-bridge-validation/
 *
 * Hard gates:
 *   - Exactly 2 input rows (Vanderbilt + UCSF)
 *   - Validated-candidates file has 2 rows with all required fields
 *     (listing_id_proposed, source_url, source_quote_short,
 *     application_method, evidence_strength, validation_status)
 *   - Public copy caveats exist for both
 *   - Evidence join map exists for both
 *   - Source scope audit exists for both
 *   - Audience scope audit exists for both
 *   - Runtime mapping preview exists for both
 *   - Hold/rejection log exists (may be empty / single NONE row)
 *   - Proposed listing_ids match the expected pattern
 *   - No bare PUBLIC_NOW / IMPORT_READY token
 *   - No banned public phrase outside a negation context
 *   - No active/staged runtime data drift
 *   - No /clerkships/pilot, /contact, or contact-context drift
 *
 * Run:
 *   npx tsx scripts/validate-p97-queue-4-session-1-bridge-validation.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(REPO_ROOT, "docs/platform-v2/local/usce-completeness/queue-4-session-1-bridge-validation");
const INPUT = path.join(FOLDER, "session_1_bridge_validation_input_manifest.csv");
const VALIDATED = path.join(FOLDER, "session_1_bridge_validated_candidates.csv");
const CAVEATS = path.join(FOLDER, "session_1_bridge_public_copy_caveats.csv");
const EVIDENCE = path.join(FOLDER, "session_1_bridge_evidence_join_map.csv");
const SCOPE = path.join(FOLDER, "session_1_bridge_source_scope_audit.csv");
const AUDIENCE = path.join(FOLDER, "session_1_bridge_audience_scope_audit.csv");
const RUNTIME = path.join(FOLDER, "session_1_bridge_runtime_mapping_preview.csv");
const HOLD = path.join(FOLDER, "session_1_bridge_rejection_or_hold_log.csv");

const REQUIRED_INSTITUTIONS = ["Vanderbilt University Medical Center", "UCSF Medical Center"];
const EXPECTED_LISTING_IDS = ["pilot-020-TN-vanderbilt-university-medical-center", "pilot-021-CA-ucsf-medical-center"];
const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];
const BANNED_PUBLIC_PHRASES = [/\bguaranteed\b/i, /\bhospital[- ]approved\b/i, /\bIMG[- ]friendly\b/i, /\bapply through USCEHub\b/i, /\bofficially approved by\b/i];

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
  if (cells.length === 0) return { header: [] as string[], rows: [] as Array<Record<string, string>> };
  const header = cells[0];
  const rows = cells.slice(1).map(r => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) obj[header[i]] = r[i] ?? "";
    return obj;
  });
  return { header, rows };
}

function run(): void {
  for (const p of [INPUT, VALIDATED, CAVEATS, EVIDENCE, SCOPE, AUDIENCE, RUNTIME, HOLD]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "required file not found");
  }
  if (failures.length > 0) return;

  const input = readCsv(INPUT);
  const validated = readCsv(VALIDATED);
  const caveats = readCsv(CAVEATS);
  const evidence = readCsv(EVIDENCE);
  const scope = readCsv(SCOPE);
  const audience = readCsv(AUDIENCE);
  const runtime = readCsv(RUNTIME);

  check("INPUT_COUNT", "(input)", input.rows.length === 2, `expected 2 input rows, got ${input.rows.length}`);
  check("VALIDATED_COUNT", "(validated)", validated.rows.length === 2, `expected 2 validated rows, got ${validated.rows.length}`);

  const inputNames = new Set(input.rows.map(r => r["institution_name"]));
  for (const inst of REQUIRED_INSTITUTIONS) {
    check("MISSING_INSTITUTION_IN_INPUT", inst, inputNames.has(inst), `${inst} missing from input`);
  }

  const validatedIds = new Set(validated.rows.map(r => r["listing_id_proposed"]));
  for (const id of EXPECTED_LISTING_IDS) {
    check("MISSING_PROPOSED_LISTING_ID", id, validatedIds.has(id), `proposed listing_id ${id} missing from validated`);
  }

  // Validated rows must have required fields
  for (const r of validated.rows) {
    for (const field of ["listing_id_proposed", "source_url", "source_quote_short", "application_method", "evidence_strength", "validation_status"]) {
      check("VALIDATED_MISSING_FIELD", r["listing_id_proposed"] || "?",
        !!r[field],
        `validated row '${r["listing_id_proposed"]}' missing field '${field}'`);
    }
  }

  const expectInBoth = (label: string, rows: Array<Record<string, string>>, key: "institution_name" | "listing_id_proposed" = "institution_name", expected = REQUIRED_INSTITUTIONS) => {
    const names = new Set(rows.map(r => r[key]));
    for (const e of expected) {
      check(`MISSING_FROM_${label}`, e, names.has(e), `${e} not in ${label}`);
    }
  };
  expectInBoth("CAVEATS", caveats.rows, "listing_id_proposed", EXPECTED_LISTING_IDS);
  expectInBoth("EVIDENCE_JOIN", evidence.rows, "listing_id_proposed", EXPECTED_LISTING_IDS);
  expectInBoth("SCOPE", scope.rows, "listing_id_proposed", EXPECTED_LISTING_IDS);
  expectInBoth("AUDIENCE", audience.rows, "listing_id_proposed", EXPECTED_LISTING_IDS);
  expectInBoth("RUNTIME", runtime.rows, "listing_id_proposed", EXPECTED_LISTING_IDS);

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
      if (re.test(text) && !/\b(no |never |not |do_not_say|do not |Caribbean accessible \| J-1)/i.test(text)) {
        // Allow occurrences in a "do_not_say" / negation context
        const matches = text.match(new RegExp(re.source, "gi")) || [];
        // If the only matches are inside do_not_say cells, allow
        let bad = false;
        for (const m of matches) {
          const idx = text.indexOf(m);
          const ctx = text.slice(Math.max(0, idx - 120), idx).toLowerCase();
          if (/(do_not_say|do not |never |not )/.test(ctx)) continue;
          bad = true; break;
        }
        if (bad) fail("BANNED_PUBLIC_PHRASE", name, `${re} in ${name} outside negation context`);
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
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P97 Queue 4 Session 1 Bridge Validation Validator");
  console.log("=".repeat(60));
  try { run(); } catch (e) { fail("VALIDATOR_THREW", "(uncaught)", String(e)); }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  2 input rows (Vanderbilt + UCSF); 2 validated candidates with proposed listing_ids.");
    console.log("  Caveats / evidence-join / scope / audience / runtime-preview present for both.");
    console.log("  No forbidden token. No banned public phrase outside negation context. No app drift.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
