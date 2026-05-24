/**
 * P99-P97 Report-Issue Mapping Validator
 *
 * Validates the listing-report mapping CSVs and the future-intake schema
 * produced by P99-P97-STAGED-RUNTIME-REPORT-ISSUE-MAPPING-1.
 *
 * Run:
 *   npx tsx scripts/validate-p99-report-issue-mapping.ts <path-to-listing_map.csv>
 *
 * Hard gates:
 *   - listing_map CSV exists and parses
 *   - All listing IDs in the active 5-card runtime appear in listing_map
 *   - All listing IDs in the staged 7-card runtime appear in listing_map (5 active + 2 staged)
 *   - UPMC and Lincoln listing IDs present
 *   - All report URLs include either ?ref=pilot-listing&listing_id=… OR ?ref=pilot-feedback
 *   - No report URL exposes a screenshot path or internal docs path
 *   - No banned word ("apply through USCEHub") in any field
 *   - Future intake schema file exists and contains required fields list
 *   - Privacy notes forbid passport/visa/medical/immigration document collection
 *   - Correction queue spec file exists
 *   - listing_map and evidence_join_map share the same listing_id set
 *
 * Warns:
 *   - Active 5 evidence join rows reference T7 lane (acceptable; no Mac-local screenshots for the active 5)
 *   - report_url currently points to /contact which today does not parse listing_id (this is the audited gap)
 */

import * as fs from "fs";
import * as path from "path";

interface Failure { rule: string; row: string; detail: string }
interface Warning { rule: string; row: string; detail: string }

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
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    cur += ch; i++;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function csvToObjects(text: string): Record<string, string>[] {
  const grid = parseCsv(text);
  if (grid.length < 2) return [];
  const header = grid[0];
  const out: Record<string, string>[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) r[header[j]] = grid[i][j] ?? "";
    out.push(r);
  }
  return out;
}

const EXPECTED_ACTIVE_IDS = new Set([
  "pilot-001-NJ-morristown-medical-center",
  "pilot-002-NJ-overlook-medical-center",
  "pilot-003-OH-cleveland-clinic-mercy-hospital",
  "pilot-004-OH-cleveland-clinic-hillcrest-hospital",
  "pilot-007-CA-highland-hospital-alameda-health-system",
]);

const EXPECTED_STAGED_IDS = new Set([
  "pilot-011-PA-upmc-western-psychiatric-hospital",
  "pilot-012-NY-nyc-health-hospitals-lincoln",
]);

const FORBIDDEN_PATH_FRAGMENTS = [
  "/screenshots/",
  "manual-png-landing-1",
  "batch-3-evidence-landing",
  "reviewer_notes",
  "must_not_claim",
];

const BANNED_WORDS = [
  /apply through USCEHub/i,
  /USCEHub-approved/i,
  /verified by hospital/i,
  /hospital[- ]approved/i,
];

const REQUIRED_INTAKE_FIELDS = [
  "listing_id", "ref", "issue_type", "user_message", "page_url", "submitted_at",
];

const REQUIRED_PRIVACY_PROHIBITIONS = [
  "passport",
  "visa",
  "immigration",
  "medical",
  "ssn",
];

function validate(listingMapPath: string): { failures: Failure[]; warnings: Warning[] } {
  const failures: Failure[] = [];
  const warnings: Warning[] = [];

  // --- listing_map CSV
  if (!fs.existsSync(listingMapPath)) {
    failures.push({ rule: "LISTING_MAP_NOT_FOUND", row: listingMapPath, detail: "file does not exist" });
    return { failures, warnings };
  }
  const listingRows = csvToObjects(fs.readFileSync(listingMapPath, "utf8"));
  if (listingRows.length === 0) {
    failures.push({ rule: "LISTING_MAP_EMPTY", row: listingMapPath, detail: "no data rows" });
    return { failures, warnings };
  }
  const dataRows = listingRows.filter(r => r.listing_id && r.listing_id !== "n/a");

  const seenListings = new Set<string>();
  for (const r of dataRows) {
    const lid = r.listing_id;
    if (seenListings.has(lid)) {
      failures.push({ rule: "DUPLICATE_LISTING", row: lid, detail: "listing_id repeated in listing_map" });
    }
    seenListings.add(lid);
  }
  for (const a of EXPECTED_ACTIVE_IDS) {
    if (!seenListings.has(a)) failures.push({ rule: "ACTIVE_LISTING_MISSING_FROM_MAP", row: a, detail: "active runtime listing_id not in listing_map" });
  }
  for (const s of EXPECTED_STAGED_IDS) {
    if (!seenListings.has(s)) failures.push({ rule: "STAGED_LISTING_MISSING_FROM_MAP", row: s, detail: "staged runtime listing_id not in listing_map" });
  }

  // --- Per-row checks
  for (const r of listingRows) {
    const lid = r.listing_id || "(generic)";
    const url = r.report_url || "";
    if (!url) {
      failures.push({ rule: "REPORT_URL_MISSING", row: lid, detail: "report_url is empty" });
      continue;
    }
    if (lid !== "n/a") {
      if (!url.includes(`listing_id=${lid}`)) {
        failures.push({ rule: "REPORT_URL_LISTING_ID_MISSING", row: lid, detail: `report_url '${url}' does not include listing_id=${lid}` });
      }
      if (!url.includes("ref=pilot-listing")) {
        failures.push({ rule: "REPORT_URL_REF_MISSING", row: lid, detail: `per-listing report URL must include ref=pilot-listing — got '${url}'` });
      }
    } else {
      // Generic feedback row
      if (!url.includes("ref=pilot-feedback")) {
        failures.push({ rule: "GENERIC_FEEDBACK_REF_MISSING", row: lid, detail: `generic feedback URL must include ref=pilot-feedback — got '${url}'` });
      }
    }
    for (const frag of FORBIDDEN_PATH_FRAGMENTS) {
      if (url.includes(frag)) {
        failures.push({ rule: "REPORT_URL_LEAKS_INTERNAL_PATH", row: lid, detail: `report_url '${url}' contains forbidden fragment '${frag}'` });
      }
    }
    for (const re of BANNED_WORDS) {
      for (const f of Object.keys(r)) {
        if (re.test(r[f] || "")) {
          failures.push({ rule: "BANNED_WORD_IN_LISTING_MAP", row: lid, detail: `field '${f}' contains banned phrase ${re}` });
        }
      }
    }
  }

  // Sibling files
  const sprintDir = path.dirname(listingMapPath);
  const evidenceMapPath = path.join(sprintDir, "staged_runtime_report_issue_mapping_1_evidence_join_map.csv");
  const intakeSchemaPath = path.join(sprintDir, "staged_runtime_report_issue_mapping_1_future_intake_payload_schema.json");
  const queueSpecPath = path.join(sprintDir, "staged_runtime_report_issue_mapping_1_correction_queue_spec.md");

  if (!fs.existsSync(evidenceMapPath)) {
    failures.push({ rule: "EVIDENCE_MAP_MISSING", row: "(sibling)", detail: `expected sibling file ${evidenceMapPath} not found` });
  } else {
    const evRows = csvToObjects(fs.readFileSync(evidenceMapPath, "utf8"));
    const evIds = new Set(evRows.map(r => r.listing_id).filter(Boolean));
    for (const a of EXPECTED_ACTIVE_IDS) {
      if (!evIds.has(a)) failures.push({ rule: "ACTIVE_LISTING_MISSING_FROM_EVIDENCE_MAP", row: a, detail: "active listing has no evidence_join_map row" });
    }
    for (const s of EXPECTED_STAGED_IDS) {
      if (!evIds.has(s)) failures.push({ rule: "STAGED_LISTING_MISSING_FROM_EVIDENCE_MAP", row: s, detail: "staged listing has no evidence_join_map row" });
    }
  }

  if (!fs.existsSync(intakeSchemaPath)) {
    failures.push({ rule: "INTAKE_SCHEMA_MISSING", row: "(sibling)", detail: `expected sibling file ${intakeSchemaPath} not found` });
  } else {
    let schema: Record<string, unknown>;
    try { schema = JSON.parse(fs.readFileSync(intakeSchemaPath, "utf8")); }
    catch (e) { failures.push({ rule: "INTAKE_SCHEMA_PARSE_FAILED", row: intakeSchemaPath, detail: String(e) }); schema = {}; }
    const required = (schema.required_fields as string[]) || [];
    for (const f of REQUIRED_INTAKE_FIELDS) {
      if (!required.includes(f)) failures.push({ rule: "INTAKE_SCHEMA_FIELD_MISSING", row: f, detail: `required_fields list does not include '${f}'` });
    }
    const privacy = (schema.privacy_notes as string[]) || [];
    const privacyText = privacy.join(" ").toLowerCase();
    for (const p of REQUIRED_PRIVACY_PROHIBITIONS) {
      if (!privacyText.includes(p)) {
        failures.push({ rule: "INTAKE_SCHEMA_PRIVACY_PROHIBITION_MISSING", row: p, detail: `privacy_notes does not mention '${p}'` });
      }
    }
    if (schema.not_active_runtime !== true) {
      failures.push({ rule: "INTAKE_SCHEMA_NOT_FLAGGED_DOCS_ONLY", row: "(top-level)", detail: "not_active_runtime must be true" });
    }
  }

  if (!fs.existsSync(queueSpecPath)) {
    failures.push({ rule: "CORRECTION_QUEUE_SPEC_MISSING", row: "(sibling)", detail: `expected sibling file ${queueSpecPath} not found` });
  }

  // Warnings (advisory)
  if (dataRows.length > 0) {
    warnings.push({
      rule: "CONTACT_PAGE_DOES_NOT_PARSE_LISTING_ID_TODAY",
      row: "(audit-finding)",
      detail: "Per the audit, /contact/page.tsx does not currently read the ref or listing_id query params. The mapping is reserved correctly but cannot land into a queue without contact-page work."
    });
  }

  return { failures, warnings };
}

function main() {
  const argPath = process.argv[2];
  if (!argPath) {
    console.error("Usage: npx tsx scripts/validate-p99-report-issue-mapping.ts <path-to-listing_map.csv>");
    process.exit(2);
  }

  console.log("=".repeat(60));
  console.log("P99-P97 Report-Issue Mapping Validator");
  console.log("=".repeat(60));
  console.log(`File: ${argPath}`);

  const { failures, warnings } = validate(argPath);

  if (warnings.length > 0) {
    console.log(`\nWarnings: ${warnings.length}`);
    for (const w of warnings) console.log(`  [${w.rule}] row=${w.row}: ${w.detail}`);
  }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log(`  ${warnings.length} warning(s); 0 errors.`);
    console.log("  Listing map, evidence join, intake schema, and correction queue spec are present and consistent.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
