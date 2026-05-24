/**
 * P99-4 Report Intake Validator
 *
 * Hard gates:
 *   - LocalReport model contains no forbidden fields (NPI/CCN/CMS/NPPES/AAMC/NRMP/ACGME/NUCC/PHI)
 *   - REPORT_EXPORT_FIELDS strips source_url_seen and status
 *   - No forbidden fields appear in buildReportExportPayload keys
 *   - useLocalReports hook uses correct LS key (uscehub_local_issue_reports_v1)
 *   - Privacy copy present: no patient information / saved locally / not sent to server
 *   - Report copy does not imply server submission or institution affiliation
 *   - No NEEDS_REVIEW / SUPPORTING_SOURCE_ONLY / POLICY_HUB card buckets reachable
 *   - Generated runtime card counts: 12 total, 7 IMG, 5 US-only
 *   - Report export fields are a clean subset (12 fields, correct set)
 *   - Forbidden language absent from report UI copy
 *
 * Run: npx tsx scripts/validate-usce-report-intake.ts
 */

import * as fs from "fs";
import * as path from "path";

const COMPONENT_FILE = path.join(__dirname, "../src/app/clerkships/maine/ClerkshipListings.tsx");
const RUNTIME_JSON = path.join(__dirname, "../src/data/usce/public-listings.generated.json");

// Fields that must never appear in the report model or exports
const FORBIDDEN_PHI_FIELDS = [
  "npi", "ccn", "cms_facility_id", "nppes_npi", "ein",
  "aamc_id", "nrmp_id", "acgme_id", "nucc_taxonomy",
  "patient", "mrn", "dob", "ssn", "date_of_birth", "social_security",
  "medical_record", "insurance_id",
];

// Strings that imply server submission when there is none
const SUBMISSION_IMPLIES_SERVER = [
  "submitting to",
  "sent to our",
  "sent to us",
  "submitted to",
  "your report will be sent",
  "your feedback will be sent",
  "we will review",
  "our team will",
  "email us",
];

// Strings that imply official institution affiliation
const AFFILIATION_IMPLIES_OFFICIAL = [
  "official feedback",
  "official report",
  "affiliated with",
  "on behalf of",
];

// Forbidden language already checked by save/compare validator — duplicate here for completeness
const FORBIDDEN_LANGUAGE = [
  "complete database",
  "all opportunities",
  "guaranteed usce",
  "guaranteed match",
  "img-friendly",
];

const REQUIRED_PRIVACY_PHRASES = [
  "do not include patient",
  "saved on this device",
  "no data is sent",
];

// Expected export field set (must exactly match this list, order-independent)
const EXPECTED_REPORT_EXPORT_FIELDS = new Set([
  "report_id", "listing_id", "institution_name", "specialty", "opportunity_type",
  "issue_type", "issue_detail", "user_email_optional", "official_source_url",
  "application_url", "created_at", "page_context",
]);

// Fields that must NOT appear in exports
const FORBIDDEN_IN_EXPORT = ["source_url_seen", "status", "LOCAL_DRAFT"];

interface Failure { rule: string; detail: string }

function readText(p: string): string {
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function main() {
  console.log("=".repeat(60));
  console.log("P99-4 USCE Report Intake Validator");
  console.log("=".repeat(60));

  const failures: Failure[] = [];
  const src = readText(COMPONENT_FILE);
  const srcLower = src.toLowerCase();

  // ── 1. LocalReport model — no forbidden fields ─────────────────────
  console.log("\n[1/8] Checking LocalReport interface for forbidden fields...");

  // Extract the LocalReport interface block
  const localReportMatch = src.match(/interface LocalReport\s*\{[\s\S]*?\}/);
  const localReportSrc = localReportMatch?.[0] ?? "";

  if (!localReportSrc) {
    failures.push({ rule: "LOCAL_REPORT_INTERFACE_MISSING", detail: "LocalReport interface not found in component" });
  }

  const forbiddenInModel: string[] = [];
  for (const f of FORBIDDEN_PHI_FIELDS) {
    const regex = new RegExp(`\\b${f}\\b`, "i");
    if (regex.test(localReportSrc)) {
      forbiddenInModel.push(f);
      failures.push({ rule: "FORBIDDEN_FIELD_IN_LOCAL_REPORT", detail: `Forbidden field '${f}' found in LocalReport interface` });
    }
  }

  console.log(`      LocalReport interface found: ${localReportSrc ? "PASS" : "FAIL"}`);
  console.log(`      No forbidden PHI/identity fields in model: ${forbiddenInModel.length === 0 ? "PASS" : `FAIL (${forbiddenInModel.join(", ")})`}`);

  // ── 2. LS key correct ──────────────────────────────────────────────
  console.log("\n[2/8] Checking localStorage key...");

  const hasLsKey = src.includes('LS_REPORTS_KEY = "uscehub_local_issue_reports_v1"');
  if (!hasLsKey) {
    failures.push({ rule: "LS_REPORTS_KEY_WRONG", detail: 'LS_REPORTS_KEY = "uscehub_local_issue_reports_v1" not found in component' });
  }
  console.log(`      LS_REPORTS_KEY correct: ${hasLsKey ? "PASS" : "FAIL"}`);

  // ── 3. REPORT_EXPORT_FIELDS — correct set, strips source_url_seen / status ──
  console.log("\n[3/8] Checking REPORT_EXPORT_FIELDS...");

  const exportFieldsMatch = src.match(/const REPORT_EXPORT_FIELDS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  const exportFieldsSrc = exportFieldsMatch?.[0] ?? "";

  if (!exportFieldsSrc) {
    failures.push({ rule: "REPORT_EXPORT_FIELDS_MISSING", detail: "REPORT_EXPORT_FIELDS constant not found in component" });
  }

  // Check forbidden fields not in export
  for (const f of FORBIDDEN_IN_EXPORT) {
    if (exportFieldsSrc.includes(`"${f}"`)) {
      failures.push({ rule: "FORBIDDEN_FIELD_IN_REPORT_EXPORT", detail: `Field '${f}' found in REPORT_EXPORT_FIELDS — must be stripped from exports` });
    }
  }

  // Check expected fields are present
  const missingExportFields: string[] = [];
  for (const f of EXPECTED_REPORT_EXPORT_FIELDS) {
    if (!exportFieldsSrc.includes(`"${f}"`)) {
      missingExportFields.push(f);
      failures.push({ rule: "REPORT_EXPORT_FIELD_MISSING", detail: `Expected export field '${f}' not found in REPORT_EXPORT_FIELDS` });
    }
  }

  // Check field count (12)
  const exportFieldQuotes = (exportFieldsSrc.match(/"[^"]+"/g) ?? []);
  const exportFieldCount = exportFieldQuotes.length;
  if (exportFieldCount !== 12) {
    failures.push({ rule: "REPORT_EXPORT_FIELD_COUNT_WRONG", detail: `Expected 12 REPORT_EXPORT_FIELDS, got ${exportFieldCount}` });
  }

  console.log(`      REPORT_EXPORT_FIELDS present: ${exportFieldsSrc ? "PASS" : "FAIL"}`);
  console.log(`      source_url_seen excluded: ${!exportFieldsSrc.includes('"source_url_seen"') ? "PASS" : "FAIL"}`);
  console.log(`      status excluded: ${!exportFieldsSrc.includes('"status"') ? "PASS" : "FAIL"}`);
  console.log(`      Missing expected fields: ${missingExportFields.length === 0 ? "PASS" : `FAIL (${missingExportFields.join(", ")})`}`);
  console.log(`      Field count: ${exportFieldCount} ${exportFieldCount === 12 ? "(PASS)" : "(FAIL — expected 12)"}`);

  // ── 4. buildReportExportPayload — no forbidden keys ────────────────
  console.log("\n[4/8] Scanning buildReportExportPayload for forbidden keys...");

  const builderMatch = src.match(/function buildReportExportPayload[\s\S]*?^}/m);
  const builderSrc = builderMatch?.[0] ?? "";

  const forbiddenInBuilder: string[] = [];
  for (const f of FORBIDDEN_PHI_FIELDS) {
    const regex = new RegExp(`["'\`]${f}["'\`]\\s*:`, "i");
    if (regex.test(builderSrc)) {
      forbiddenInBuilder.push(f);
      failures.push({ rule: "FORBIDDEN_FIELD_IN_REPORT_BUILDER", detail: `Forbidden field '${f}' appears as key in buildReportExportPayload` });
    }
  }
  // Also check source_url_seen and status are not in builder output
  for (const f of ["source_url_seen", "status"]) {
    const regex = new RegExp(`["'\`]${f}["'\`]\\s*:`);
    if (regex.test(builderSrc)) {
      failures.push({ rule: "STRIPPED_FIELD_IN_REPORT_BUILDER", detail: `Field '${f}' appears in buildReportExportPayload — should be stripped` });
    }
  }

  console.log(`      No forbidden keys in builder: ${forbiddenInBuilder.length === 0 ? "PASS" : `FAIL (${forbiddenInBuilder.join(", ")})`}`);
  console.log(`      source_url_seen stripped from builder: ${!builderSrc.includes('"source_url_seen"') ? "PASS" : "FAIL"}`);
  console.log(`      status stripped from builder: ${!builderSrc.includes('"status"') ? "PASS" : "FAIL"}`);

  // ── 5. Privacy copy present ────────────────────────────────────────
  console.log("\n[5/8] Checking privacy copy...");

  const privacyHits: string[] = [];
  const privacyMissing: string[] = [];
  for (const phrase of REQUIRED_PRIVACY_PHRASES) {
    if (srcLower.includes(phrase)) {
      privacyHits.push(phrase);
    } else {
      privacyMissing.push(phrase);
      failures.push({ rule: "PRIVACY_COPY_MISSING", detail: `Required privacy phrase not found: "${phrase}"` });
    }
  }
  console.log(`      Privacy phrases found: ${privacyHits.length}/${REQUIRED_PRIVACY_PHRASES.length}`);
  if (privacyMissing.length > 0) {
    console.log(`      Missing: ${privacyMissing.join("; ")}`);
  }

  // ── 6. No false server-submission or affiliation language ──────────
  console.log("\n[6/8] Checking for false server-submission / affiliation language...");

  const serverFails: string[] = [];
  for (const phrase of SUBMISSION_IMPLIES_SERVER) {
    if (srcLower.includes(phrase)) {
      serverFails.push(phrase);
      failures.push({ rule: "FALSE_SERVER_SUBMISSION_LANGUAGE", detail: `Phrase implies server submission: "${phrase}"` });
    }
  }
  const affiliationFails: string[] = [];
  for (const phrase of AFFILIATION_IMPLIES_OFFICIAL) {
    if (srcLower.includes(phrase)) {
      affiliationFails.push(phrase);
      failures.push({ rule: "FALSE_AFFILIATION_LANGUAGE", detail: `Phrase implies institution affiliation: "${phrase}"` });
    }
  }
  console.log(`      No server-submission language: ${serverFails.length === 0 ? "PASS" : `FAIL (${serverFails.join("; ")})`}`);
  console.log(`      No affiliation language: ${affiliationFails.length === 0 ? "PASS" : `FAIL (${affiliationFails.join("; ")})`}`);

  // ── 7. Non-public buckets not reachable via reports ────────────────
  console.log("\n[7/8] Checking non-public bucket references in report flow...");

  // The report flow should never reference NEEDS_REVIEW, SUPPORTING_SOURCE_ONLY directly
  // in the report UI components (acceptable in validator scripts, not in component)
  const reportFlowMatch = src.match(/function ReportIssueModal[\s\S]*?^}/m);
  const reportFlowSrc = reportFlowMatch?.[0] ?? "";
  const reportsPanel = src.match(/function LocalReportsPanel[\s\S]*?^}/m)?.[0] ?? "";

  const NON_PUBLIC_IN_REPORT_UI = ["NEEDS_REVIEW", "SUPPORTING_SOURCE_ONLY", "POLICY_HUB"];
  const nonPublicFails: string[] = [];
  for (const bucket of NON_PUBLIC_IN_REPORT_UI) {
    if (reportFlowSrc.includes(bucket) || reportsPanel.includes(bucket)) {
      nonPublicFails.push(bucket);
      failures.push({ rule: "NON_PUBLIC_BUCKET_IN_REPORT_UI", detail: `Non-public bucket '${bucket}' referenced in report UI components` });
    }
  }
  console.log(`      No non-public bucket refs in report UI: ${nonPublicFails.length === 0 ? "PASS" : `FAIL (${nonPublicFails.join(", ")})`}`);

  // Forbidden general language
  const langFails: string[] = [];
  for (const phrase of FORBIDDEN_LANGUAGE) {
    if (srcLower.includes(phrase)) {
      langFails.push(phrase);
      failures.push({ rule: "FORBIDDEN_LANGUAGE_IN_COMPONENT", detail: `"${phrase}" found in component source` });
    }
  }
  console.log(`      No forbidden language: ${langFails.length === 0 ? "PASS" : `FAIL (${langFails.join("; ")})`}`);

  // ── 8. Generated runtime card counts ──────────────────────────────
  console.log("\n[8/8] Checking generated runtime card counts...");

  let runtimeTotal = -1;
  let runtimeImg = -1;
  let runtimeUs = -1;

  if (fs.existsSync(RUNTIME_JSON)) {
    const raw = JSON.parse(fs.readFileSync(RUNTIME_JSON, "utf8"));
    const cards: { display_bucket: string }[] = raw.cards ?? [];
    runtimeTotal = cards.length;
    runtimeImg = cards.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT").length;
    runtimeUs = cards.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY").length;

    if (runtimeTotal !== 12) failures.push({ rule: "RUNTIME_TOTAL_COUNT_WRONG", detail: `Expected 12 total cards, got ${runtimeTotal}` });
    if (runtimeImg !== 7) failures.push({ rule: "RUNTIME_IMG_COUNT_WRONG", detail: `Expected 7 IMG cards, got ${runtimeImg}` });
    if (runtimeUs !== 5) failures.push({ rule: "RUNTIME_US_COUNT_WRONG", detail: `Expected 5 US-only cards, got ${runtimeUs}` });
  } else {
    failures.push({ rule: "RUNTIME_FILE_MISSING", detail: "src/data/usce/public-listings.generated.json not found" });
  }

  console.log(`      Total: ${runtimeTotal} ${runtimeTotal === 12 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      IMG-relevant: ${runtimeImg} ${runtimeImg === 7 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      US-only: ${runtimeUs} ${runtimeUs === 5 ? "(PASS)" : "(FAIL)"}`);

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  const passed = failures.length === 0;
  console.log(`\nOverall: ${passed ? "PASSED" : "FAILED"}`);

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach((f) => console.log(`  [${f.rule}] ${f.detail}`));
  } else {
    console.log("  All P99-4 report intake hard gates passed.");
    console.log("  LocalReport model: clean (no PHI / identity fields)");
    console.log("  REPORT_EXPORT_FIELDS: 12 fields, source_url_seen + status stripped");
    console.log("  Privacy copy: present (no patient info / saved locally / not sent)");
    console.log("  No server-submission or affiliation language");
    console.log("  Runtime: 12 cards (7 IMG + 5 US-only)");
  }

  process.exit(passed ? 0 : 1);
}

main();
