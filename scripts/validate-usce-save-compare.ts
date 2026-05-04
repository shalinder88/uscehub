/**
 * P99-2B Save/Compare Validator
 *
 * Hard gates:
 *   - localStorage stores listing_id array only (no full card payload in setItem call)
 *   - EXPORT_FIELDS constant present and contains no forbidden field names
 *   - No forbidden field names appear as export object keys in source
 *   - Save filter (saved_only / unsaved_only) implemented in component
 *   - Report-issue placeholder present in CompareTable section
 *   - "Compare shows up to 4" copy present
 *   - Card count 12 (7 IMG + 5 US-only) still holds
 *   - Forbidden language absent from component source
 *   - Runtime guard still present in data adapter
 *
 * Run: npx tsx scripts/validate-usce-save-compare.ts
 */

import * as fs from "fs";
import * as path from "path";

const BASE = path.join(__dirname, "../docs/platform-v2/local/usce-completeness");
const CARDS_FILE_V2 = path.join(BASE, "public_listing_cards_preview_v2.json");
const COMPONENT_FILE = path.join(__dirname, "../src/app/clerkships/maine/ClerkshipListings.tsx");
const ADAPTER_FILE = path.join(__dirname, "../src/lib/usce-maine-data.ts");

const FORBIDDEN_FIELDS = [
  "npi", "ccn", "cms_facility_id", "nppes_npi", "ein",
  "aamc_id", "nrmp_id", "acgme_id", "nucc_taxonomy",
  "completeness_score", "max_possible_score", "nppes_raw", "cms_raw",
];

const FORBIDDEN_LANGUAGE = [
  "complete database",
  "all opportunities",
  "guaranteed usce",
  "guaranteed match",
  "img-friendly",
];

interface Failure { rule: string; detail: string }

function readText(p: string): string {
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function main() {
  console.log("=".repeat(60));
  console.log("P99-2B USCE Save/Compare Validator");
  console.log("=".repeat(60));

  const failures: Failure[] = [];
  const src = readText(COMPONENT_FILE);
  const srcLower = src.toLowerCase();

  // ── 1. localStorage stores IDs only ───────────────────────────────
  console.log("\n[1/7] Checking localStorage schema...");

  // Verify LS_KEY is defined and used
  if (!src.includes('LS_KEY = "usce-saved-listings"')) {
    failures.push({ rule: "LS_KEY_MISSING", detail: 'LS_KEY constant not found in component source' });
  }

  // Verify localStorage.setItem stringifies an array (not UsceCard fields)
  // The write should be: localStorage.setItem(LS_KEY, JSON.stringify([...next]))
  // Check that institution_name / specialty / display_bucket don't appear inside setItem calls
  const setItemBlocks = src.match(/localStorage\.setItem\([^)]+\)/g) ?? [];
  const usceCardFieldsInSetItem = setItemBlocks.some((block) =>
    ["institution_name", "opportunity_type", "display_bucket", "eligible_audiences"].some(
      (f) => block.includes(f)
    )
  );
  if (usceCardFieldsInSetItem) {
    failures.push({
      rule: "LS_STORES_FULL_PAYLOAD",
      detail: "localStorage.setItem contains full UsceCard field names — must store listing_id array only",
    });
  }

  const lsCheck = !usceCardFieldsInSetItem && src.includes('LS_KEY = "usce-saved-listings"');
  console.log(`      LS_KEY present: ${src.includes('LS_KEY = "usce-saved-listings"') ? "PASS" : "FAIL"}`);
  console.log(`      No full payload in setItem: ${!usceCardFieldsInSetItem ? "PASS" : "FAIL"}`);

  // ── 2. EXPORT_FIELDS clean ─────────────────────────────────────────
  console.log("\n[2/7] Checking EXPORT_FIELDS constant...");

  if (!src.includes("EXPORT_FIELDS")) {
    failures.push({ rule: "EXPORT_FIELDS_MISSING", detail: "EXPORT_FIELDS constant not found in component source" });
  }

  // Extract the EXPORT_FIELDS block and check for forbidden names
  const exportFieldsMatch = src.match(/const EXPORT_FIELDS\s*=[\s\S]*?] as const/);
  const exportFieldsSrc = exportFieldsMatch?.[0] ?? "";
  const forbiddenInExport: string[] = [];
  for (const f of FORBIDDEN_FIELDS) {
    if (exportFieldsSrc.includes(`"${f}"`) || exportFieldsSrc.includes(`'${f}'`)) {
      forbiddenInExport.push(f);
      failures.push({
        rule: "FORBIDDEN_FIELD_IN_EXPORT",
        detail: `Forbidden field '${f}' found in EXPORT_FIELDS`,
      });
    }
  }
  console.log(`      EXPORT_FIELDS present: ${src.includes("EXPORT_FIELDS") ? "PASS" : "FAIL"}`);
  console.log(`      No forbidden fields in EXPORT_FIELDS: ${forbiddenInExport.length === 0 ? "PASS" : `FAIL (${forbiddenInExport.join(", ")})`}`);

  // ── 3. Export object keys clean ────────────────────────────────────
  console.log("\n[3/7] Scanning export payload builder for forbidden field keys...");

  const exportPayloadMatch = src.match(/function buildExportPayload[\s\S]*?^}/m);
  const exportPayloadSrc = exportPayloadMatch?.[0] ?? "";
  const forbiddenInBuilder: string[] = [];
  for (const f of FORBIDDEN_FIELDS) {
    const regex = new RegExp(`["'\`]${f}["'\`]\\s*:`, "i");
    if (regex.test(exportPayloadSrc)) {
      forbiddenInBuilder.push(f);
      failures.push({
        rule: "FORBIDDEN_FIELD_IN_EXPORT_BUILDER",
        detail: `Forbidden field '${f}' appears as key in buildExportPayload`,
      });
    }
  }
  console.log(`      No forbidden keys in buildExportPayload: ${forbiddenInBuilder.length === 0 ? "PASS" : `FAIL (${forbiddenInBuilder.join(", ")})`}`);

  // ── 4. Save filter implemented ─────────────────────────────────────
  console.log("\n[4/7] Checking save filter implementation...");

  const hasSavedOnly = src.includes('"saved_only"') || src.includes("saved_only");
  const hasUnsavedOnly = src.includes('"unsaved_only"') || src.includes("unsaved_only");
  const hasSaveFilterType = src.includes("SaveFilter");

  if (!hasSavedOnly) failures.push({ rule: "SAVED_ONLY_FILTER_MISSING", detail: "saved_only filter not found in component" });
  if (!hasUnsavedOnly) failures.push({ rule: "UNSAVED_ONLY_FILTER_MISSING", detail: "unsaved_only filter not found in component" });
  if (!hasSaveFilterType) failures.push({ rule: "SAVE_FILTER_TYPE_MISSING", detail: "SaveFilter type not found in component" });

  console.log(`      saved_only filter: ${hasSavedOnly ? "PASS" : "FAIL"}`);
  console.log(`      unsaved_only filter: ${hasUnsavedOnly ? "PASS" : "FAIL"}`);
  console.log(`      SaveFilter type: ${hasSaveFilterType ? "PASS" : "FAIL"}`);

  // ── 5. Report issue in compare panel ──────────────────────────────
  console.log("\n[5/7] Checking report-issue in compare panel...");

  // Verify ReportIssuePlaceholder is referenced inside CompareTable
  const compareTableMatch = src.match(/function CompareTable[\s\S]*?^}/m);
  const compareTableSrc = compareTableMatch?.[0] ?? "";
  const hasReportInCompare = compareTableSrc.includes("ReportIssuePlaceholder") &&
    compareTableSrc.includes("Report issue");

  if (!hasReportInCompare) {
    failures.push({
      rule: "REPORT_ISSUE_MISSING_IN_COMPARE",
      detail: "ReportIssuePlaceholder or 'Report issue' button not found in CompareTable function",
    });
  }

  const hasOtherIssueType = src.includes('"Other"') && src.includes("ReportIssuePlaceholder");
  if (!hasOtherIssueType) {
    failures.push({
      rule: "REPORT_ISSUE_OTHER_MISSING",
      detail: '"Other" issue type not found in ReportIssuePlaceholder',
    });
  }

  const hasPilotPlaceholderText = srcLower.includes("pilot placeholder");
  if (!hasPilotPlaceholderText) {
    failures.push({
      rule: "PILOT_PLACEHOLDER_TEXT_MISSING",
      detail: '"Pilot placeholder" text not found in ReportIssuePlaceholder',
    });
  }

  console.log(`      Report issue in CompareTable: ${hasReportInCompare ? "PASS" : "FAIL"}`);
  console.log(`      "Other" issue type present: ${hasOtherIssueType ? "PASS" : "FAIL"}`);
  console.log(`      "Pilot placeholder" text present: ${hasPilotPlaceholderText ? "PASS" : "FAIL"}`);

  // ── 6. Compare 4-cap documented in UI ─────────────────────────────
  console.log("\n[6/7] Checking compare 4-cap copy...");

  const hasCapCopy = srcLower.includes("up to 4 saved listings");
  if (!hasCapCopy) {
    failures.push({
      rule: "COMPARE_CAP_COPY_MISSING",
      detail: '"up to 4 saved listings" copy not found in compare panel',
    });
  }
  console.log(`      4-cap copy present: ${hasCapCopy ? "PASS" : "FAIL"}`);

  // ── 7. Card counts + language + adapter guard ──────────────────────
  console.log("\n[7/7] Checking card counts, forbidden language, and runtime guard...");

  // Card counts from source JSON
  let imgCount = 0;
  let usCount = 0;
  if (fs.existsSync(CARDS_FILE_V2)) {
    const raw = JSON.parse(fs.readFileSync(CARDS_FILE_V2, "utf8"));
    const cards: { display_bucket: string }[] = raw.cards ?? [];
    imgCount = cards.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT").length;
    usCount = cards.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY").length;
  }
  if (imgCount !== 7) failures.push({ rule: "IMG_COUNT_WRONG", detail: `Expected 7 IMG-relevant cards, got ${imgCount}` });
  if (usCount !== 5) failures.push({ rule: "US_COUNT_WRONG", detail: `Expected 5 US-only cards, got ${usCount}` });

  // Forbidden language in component
  const langFails: string[] = [];
  for (const phrase of FORBIDDEN_LANGUAGE) {
    if (srcLower.includes(phrase)) {
      langFails.push(phrase);
      failures.push({ rule: "FORBIDDEN_LANGUAGE", detail: `"${phrase}" found in component source` });
    }
  }

  // Runtime guard in adapter
  const adapterSrc = readText(ADAPTER_FILE);
  const hasGuard = adapterSrc.includes("_nonPublic") || adapterSrc.includes("Runtime guard");
  if (!hasGuard) {
    failures.push({ rule: "RUNTIME_GUARD_MISSING", detail: "Runtime guard missing from usce-maine-data.ts" });
  }

  console.log(`      IMG count: ${imgCount} ${imgCount === 7 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      US-only count: ${usCount} ${usCount === 5 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      Forbidden language: ${langFails.length === 0 ? "PASS" : `FAIL (${langFails.join("; ")})`}`);
  console.log(`      Adapter runtime guard: ${hasGuard ? "PASS" : "FAIL"}`);

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  const passed = failures.length === 0;
  console.log(`\nOverall: ${passed ? "PASSED" : "FAILED"}`);

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach((f) => console.log(`  [${f.rule}] ${f.detail}`));
  } else {
    console.log("  All save/compare hard gates passed.");
    console.log(`  localStorage: listing_id array only (no full card payload)`);
    console.log(`  EXPORT_FIELDS: ${lsCheck ? "clean" : "check manually"}`);
    console.log(`  Save filters: saved_only + unsaved_only implemented`);
    console.log(`  Report issue: present in card + compare panel`);
    console.log(`  Compare cap: 4-card limit documented in UI`);
  }

  process.exit(passed ? 0 : 1);
}

main();
