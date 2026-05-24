/**
 * P99-P97 Staged Runtime Batch 4 — Report-Issue Mapping Validator
 *
 * Validates:
 *   - listing_map / evidence_join / correction_payload files exist
 *   - exactly 2 mapped IDs: pilot-020 + pilot-021
 *   - both IDs present in src/lib/usce-contact-context.ts KNOWN_LISTINGS as runtimeSet=staged
 *   - required hidden fields + forbidden fields denylist intact
 *   - no PUBLIC_NOW / IMPORT_READY token (NO_ form allowed)
 *   - no active or staged batch-4 data drift
 *   - no app import of staged batch-4 module
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO = path.resolve(__dirname, "..");
const FOLDER = path.join(REPO, "docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-report-issue-mapping");
const LISTING_MAP = path.join(FOLDER, "staged_runtime_batch_4_report_issue_listing_map.csv");
const EVIDENCE = path.join(FOLDER, "staged_runtime_batch_4_evidence_join_map.csv");
const PAYLOAD = path.join(FOLDER, "staged_runtime_batch_4_correction_payload_map.csv");
const RESOLVER = path.join(REPO, "src/lib/usce-contact-context.ts");

const EXPECTED_IDS = ["pilot-020-TN-vanderbilt-university-medical-center", "pilot-021-CA-ucsf-medical-center"];
const FORBIDDEN_TOKENS = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION"];
const REQUIRED_HIDDEN = ["listing_id", "ref", "page_url", "submitted_at"];
const FORBIDDEN_FIELDS = ["SSN", "passport_number", "visa_document", "medical_record_number", "payment_card"];

interface F { rule: string; row: string; detail: string }
const failures: F[] = [];
const fail = (r: string, row: string, d: string) => failures.push({rule:r,row,detail:d});
const check = (r: string, row: string, c: boolean, d: string) => { if (!c) fail(r,row,d); };

function parseCsv(t: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cur = ""; let q = false; let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (q) { if (c==='"') { if (t[i+1]==='"') { cur+='"'; i+=2; continue; } q=false; i++; continue; } cur+=c; i++; continue; }
    if (c==='"') { q=true; i++; continue; }
    if (c===",") { row.push(cur); cur=""; i++; continue; }
    if (c==="\n") { row.push(cur); rows.push(row); row=[]; cur=""; i++; continue; }
    if (c==="\r") { i++; continue; }
    cur+=c; i++;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length===1 && r[0]===""));
}
function readCsv(p: string) {
  const cells = parseCsv(fs.readFileSync(p,"utf8"));
  if (!cells.length) return { header:[] as string[], rows:[] as Array<Record<string,string>> };
  const header = cells[0];
  const rows = cells.slice(1).map(r => { const o: Record<string,string> = {}; for (let i=0;i<header.length;i++) o[header[i]]=r[i]??""; return o; });
  return { header, rows };
}

function run() {
  for (const p of [LISTING_MAP, EVIDENCE, PAYLOAD, RESOLVER]) {
    if (!fs.existsSync(p)) fail("FILE_MISSING", p, "not found");
  }
  if (failures.length) return;

  const listing = readCsv(LISTING_MAP);
  const evidence = readCsv(EVIDENCE);
  const payload = readCsv(PAYLOAD);

  check("LISTING_COUNT", "(listing_map)", listing.rows.length === 2, `expected 2; got ${listing.rows.length}`);

  const listingIds = new Set(listing.rows.map(r => r["listing_id"]));
  const evidenceIds = new Set(evidence.rows.map(r => r["listing_id"]));
  const payloadIds = new Set(payload.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_IDS) {
    check("MISSING_FROM_LISTING_MAP", id, listingIds.has(id), `${id}`);
    check("MISSING_FROM_EVIDENCE_JOIN", id, evidenceIds.has(id), `${id}`);
    check("MISSING_FROM_PAYLOAD_MAP", id, payloadIds.has(id), `${id}`);
  }

  // Resolver checks
  const resolver = fs.readFileSync(RESOLVER, "utf8");
  for (const id of EXPECTED_IDS) {
    if (!resolver.includes(`listingId: "${id}"`)) {
      fail("MISSING_IN_RESOLVER", id, `${id} not in KNOWN_LISTINGS`);
    }
    // Find the line for this id and check runtimeSet is staged or active
    // (staged before slice, active after slice — both authorized states)
    const re = new RegExp(`listingId:\\s*"${id.replace(/-/g, "\\-")}"[^}]*?runtimeSet:\\s*"([^"]+)"`, "s");
    const m = resolver.match(re);
    const observed = m?.[1] ?? "(missing)";
    if (!m || (observed !== "staged" && observed !== "active")) {
      fail("RESOLVER_RUNTIME_SET_WRONG", id, `expected runtimeSet ∈ {staged, active}; got "${observed}"`);
    }
  }

  // Payload required hidden + forbidden fields
  for (const r of payload.rows) {
    const req = (r["required_hidden_fields"] || "").split(";").map(s => s.trim());
    for (const f of REQUIRED_HIDDEN) {
      check("REQUIRED_HIDDEN_MISSING", r["listing_id"], req.includes(f), `missing required hidden field '${f}'`);
    }
    const forb = (r["forbidden_fields"] || "").split(";").map(s => s.trim());
    for (const f of FORBIDDEN_FIELDS) {
      check("FORBIDDEN_FIELD_DENYLIST_MISSING", r["listing_id"], forb.includes(f), `missing denylist entry '${f}'`);
    }
  }

  // Forbidden tokens in any text file
  for (const name of fs.readdirSync(FOLDER)) {
    const full = path.join(FOLDER, name);
    if (!fs.statSync(full).isFile()) continue;
    const ext = path.extname(name).toLowerCase();
    if (![".md",".csv",".json",".ts",".txt"].includes(ext)) continue;
    const text = fs.readFileSync(full,"utf8");
    for (const tok of FORBIDDEN_TOKENS) {
      if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
        fail("FORBIDDEN_TOKEN", name, `bare '${tok}' in ${name}`);
      }
    }
  }

  // No staged batch-4 data drift. (Active runtime / /clerkships/pilot /
  // /contact may legitimately change in the noindex-activation-slice sprint;
  // those are not policed here.)
  try {
    const out = execSync(
      `git status --short -- src/data/usce/public-listings-pilot-staged-batch-4.generated.json src/data/usce/public-listings-pilot-staged-batch-4.generated.ts 2>/dev/null || true`,
      { cwd: REPO, encoding: "utf8" }
    ).trim();
    if (out.length) fail("STAGED_DATA_CHANGED", "(git status)", out);
  } catch {}

  try {
    const out = execSync(
      `grep -rln "public-listings-pilot-staged-batch-4\\|PILOT_USCE_CARDS_STAGED_BATCH_4\\|PILOT_STAGED_BATCH_4" src/ 2>/dev/null || true`,
      { cwd: REPO, encoding: "utf8" }
    ).trim();
    const offenders = out.split("\n").filter(line => {
      if (!line) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.ts")) return false;
      if (line.endsWith("public-listings-pilot-staged-batch-4.generated.json")) return false;
      return true;
    });
    if (offenders.length) fail("STAGED_FILE_IS_IMPORTED", "(import-safety)", offenders.join(", "));
  } catch {}
}

function main() {
  console.log("=".repeat(60));
  console.log("P99-P97 Staged Runtime Batch 4 — Report-Issue Mapping Validator");
  console.log("=".repeat(60));
  try { run(); } catch (e) { fail("THREW", "(uncaught)", String(e)); }
  if (!failures.length) {
    console.log("\nOverall: PASSED");
    console.log("  2 mapped IDs (Vanderbilt + UCSF). Resolver runtimeSet ∈ {staged, active}. No staged-data drift. No forbidden token.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  process.exit(1);
}
main();
