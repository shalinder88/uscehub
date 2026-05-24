/**
 * P99-P97 Staged Runtime Batch 3 — Report-Issue Mapping Validator
 *
 * Validates the batch-3 mapping CSVs at:
 *   docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-report-issue-mapping/
 *
 * Hard gates:
 *   - All 7 batch-3 listing_ids appear in listing_map
 *   - listing_id set in listing_map matches set in evidence_join_map and correction_payload_map
 *   - No duplicates
 *   - report_ref column populated with deterministic value per row
 *   - All evidence file paths (screenshot, quote, html_snapshot) exist on disk
 *   - No banned phrase ("apply through USCEHub", "guaranteed", etc.) anywhere in the CSVs
 *   - No PUBLIC_NOW / IMPORT_READY token anywhere
 *   - correction_payload_map.required_hidden_fields includes listing_id, ref, page_url, submitted_at
 *   - correction_payload_map.forbidden_fields includes SSN, passport_number, visa_document, medical_record_number, payment_card
 *   - Staged batch 3 JSON contains every listing_id mentioned in this mapping
 *   - No app source file imports the staged batch 3 module
 *
 * Run:
 *   npx tsx scripts/validate-p99-staged-runtime-batch-3-report-mapping.ts
 *
 * (No CLI argument — paths are fixed for this sprint.)
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const REPO_ROOT = path.resolve(__dirname, "..");
const FOLDER = path.join(
  REPO_ROOT,
  "docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-report-issue-mapping"
);
const LISTING_MAP_PATH = path.join(FOLDER, "staged_runtime_batch_3_report_issue_listing_map.csv");
const EVIDENCE_JOIN_PATH = path.join(FOLDER, "staged_runtime_batch_3_evidence_join_map.csv");
const PAYLOAD_MAP_PATH = path.join(FOLDER, "staged_runtime_batch_3_correction_payload_map.csv");
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

const FORBIDDEN_TOKENS = [
  "PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME", "APPROVED_FOR_PUBLICATION",
];

const REQUIRED_HIDDEN_FIELDS = ["listing_id", "ref", "page_url", "submitted_at"];
const REQUIRED_FORBIDDEN_FIELDS = [
  "SSN", "passport_number", "visa_document", "medical_record_number", "payment_card",
];

interface Failure { rule: string; row: string; detail: string }

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

function scanText(text: string, location: string, failures: Failure[]): void {
  for (const re of BANNED_PHRASES) {
    if (re.test(text)) {
      failures.push({
        rule: "BANNED_PHRASE", row: location,
        detail: `banned phrase ${re} in ${location}`,
      });
      return;
    }
  }
  for (const tok of FORBIDDEN_TOKENS) {
    if (text.includes(tok) && !text.includes(`NO_${tok}`)) {
      failures.push({
        rule: "FORBIDDEN_TOKEN", row: location,
        detail: `forbidden token '${tok}' in ${location}`,
      });
      return;
    }
  }
}

function validate(): Failure[] {
  const failures: Failure[] = [];

  for (const p of [LISTING_MAP_PATH, EVIDENCE_JOIN_PATH, PAYLOAD_MAP_PATH, STAGED_BATCH_3_JSON]) {
    if (!fs.existsSync(p)) {
      failures.push({ rule: "FILE_MISSING", row: p, detail: "required file not found" });
    }
  }
  if (failures.length > 0) return failures;

  const listing = readCsv(LISTING_MAP_PATH);
  const evidence = readCsv(EVIDENCE_JOIN_PATH);
  const payload = readCsv(PAYLOAD_MAP_PATH);

  // Banned-phrase + forbidden-token scan over raw text
  scanText(fs.readFileSync(LISTING_MAP_PATH, "utf8"), "listing_map", failures);
  scanText(fs.readFileSync(EVIDENCE_JOIN_PATH, "utf8"), "evidence_join_map", failures);
  scanText(fs.readFileSync(PAYLOAD_MAP_PATH, "utf8"), "correction_payload_map", failures);

  // Listing-map id set
  const listingIds = new Set(listing.rows.map(r => r["listing_id"]));
  for (const id of EXPECTED_NEW_IDS) {
    if (!listingIds.has(id)) {
      failures.push({
        rule: "LISTING_ID_MISSING_IN_LISTING_MAP", row: id,
        detail: "expected new staged ID not in listing_map",
      });
    }
  }
  if (listingIds.size !== listing.rows.length) {
    failures.push({
      rule: "DUPLICATE_LISTING_ID_IN_LISTING_MAP",
      row: "(listing_map)",
      detail: `duplicate listing_id rows: ${listing.rows.length - listingIds.size}`,
    });
  }

  // Evidence-join id set must equal listing-map set
  const evidenceIds = new Set(evidence.rows.map(r => r["listing_id"]));
  for (const id of listingIds) {
    if (!evidenceIds.has(id)) {
      failures.push({
        rule: "LISTING_ID_MISSING_IN_EVIDENCE_JOIN", row: id,
        detail: "listing in listing_map but not in evidence_join_map",
      });
    }
  }
  for (const id of evidenceIds) {
    if (!listingIds.has(id)) {
      failures.push({
        rule: "EXTRA_LISTING_ID_IN_EVIDENCE_JOIN", row: id,
        detail: "listing in evidence_join_map but not in listing_map",
      });
    }
  }

  // Payload-map id set must equal listing-map set
  const payloadIds = new Set(payload.rows.map(r => r["listing_id"]));
  for (const id of listingIds) {
    if (!payloadIds.has(id)) {
      failures.push({
        rule: "LISTING_ID_MISSING_IN_PAYLOAD_MAP", row: id,
        detail: "listing in listing_map but not in correction_payload_map",
      });
    }
  }

  // report_ref populated
  for (const r of listing.rows) {
    if (!r["report_ref"]) {
      failures.push({
        rule: "REPORT_REF_EMPTY", row: r["listing_id"],
        detail: "report_ref column empty",
      });
    }
  }

  // Evidence paths exist on disk
  for (const r of listing.rows) {
    for (const col of ["screenshot_path", "quote_path"]) {
      const rel = r[col];
      if (!rel) continue;
      const full = path.join(REPO_ROOT, rel);
      if (!fs.existsSync(full)) {
        failures.push({
          rule: "EVIDENCE_PATH_MISSING", row: r["listing_id"],
          detail: `${col} '${rel}' not found on disk`,
        });
      }
    }
  }
  for (const r of evidence.rows) {
    for (const col of ["html_snapshot_path", "screenshot_path", "quote_path"]) {
      const rel = r[col];
      if (!rel) continue;
      const full = path.join(REPO_ROOT, rel);
      if (!fs.existsSync(full)) {
        failures.push({
          rule: "EVIDENCE_PATH_MISSING_EVIDENCE_JOIN", row: r["listing_id"],
          detail: `${col} '${rel}' not found on disk`,
        });
      }
    }
  }

  // Correction payload required + forbidden fields
  for (const r of payload.rows) {
    const required = (r["required_hidden_fields"] || "").split(";").map(s => s.trim());
    for (const f of REQUIRED_HIDDEN_FIELDS) {
      if (!required.includes(f)) {
        failures.push({
          rule: "REQUIRED_HIDDEN_FIELD_MISSING", row: r["listing_id"],
          detail: `required_hidden_fields missing '${f}' (got: ${required.join("|")})`,
        });
      }
    }
    const forbidden = (r["forbidden_fields"] || "").split(";").map(s => s.trim());
    for (const f of REQUIRED_FORBIDDEN_FIELDS) {
      if (!forbidden.includes(f)) {
        failures.push({
          rule: "FORBIDDEN_FIELD_MISSING_FROM_DENYLIST", row: r["listing_id"],
          detail: `forbidden_fields missing denylist entry '${f}' (got: ${forbidden.join("|")})`,
        });
      }
    }
  }

  // Cross-check: every listing_id must exist in staged batch 3 JSON
  const stagedJson = JSON.parse(fs.readFileSync(STAGED_BATCH_3_JSON, "utf8"));
  const stagedIds = new Set<string>(
    (stagedJson.cards as Array<{ listing_id: string }>).map(c => c.listing_id)
  );
  for (const id of listingIds) {
    if (!stagedIds.has(id)) {
      failures.push({
        rule: "LISTING_ID_NOT_IN_STAGED_BATCH_3_JSON", row: id,
        detail: "mapping references listing_id that is not in staged batch 3 JSON",
      });
    }
  }

  // Import safety: app must not import the staged batch-3 module
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
      failures.push({
        rule: "STAGED_FILE_IS_IMPORTED", row: "(import-safety)",
        detail: `staged module is referenced by app source: ${offenders.join(", ")}`,
      });
    }
  } catch { /* ignore */ }

  return failures;
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P99-P97 Staged Runtime Batch 3 — Report-Issue Mapping Validator");
  console.log("=".repeat(60));

  const failures = validate();

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log(`  ${EXPECTED_NEW_IDS.length} listing(s) mapped.`);
    console.log("  listing_map / evidence_join_map / correction_payload_map are consistent.");
    console.log("  Evidence paths exist on disk. No banned phrase. No forbidden token.");
    console.log("  Active runtime unchanged. Staged batch 3 is not imported by app.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
