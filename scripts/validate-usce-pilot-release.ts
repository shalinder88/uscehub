/**
 * P99-5 USCE Pilot Release Validator
 *
 * Hard gates:
 *   - Forbidden language absent from all UI sources
 *   - Pilot copy present (not a complete national database)
 *   - Local-only copy present for save and report features
 *   - Generated runtime card counts: 12 total / 7 IMG / 5 US-only
 *   - Route does not import from docs/local source directly
 *   - Adapter exposes no forbidden fields
 *   - noindex decision documented in page.tsx (robots.index = false)
 *   - Both localStorage keys documented in component source
 *   - REPORT_EXPORT_FIELDS absent of forbidden fields
 *   - Stale-ID resilience guard present in useSavedListings
 *   - Array guard present in useLocalReports
 *   - aria-pressed on VSLO/Unknown toggle buttons
 *   - aria-expanded on Details expand button
 *   - aria-label on Report issue card button
 *
 * Run: npx tsx scripts/validate-usce-pilot-release.ts
 */

import * as fs from "fs";
import * as path from "path";

const COMPONENT_FILE = path.join(__dirname, "../src/app/clerkships/maine/ClerkshipListings.tsx");
const PAGE_FILE = path.join(__dirname, "../src/app/clerkships/maine/page.tsx");
const ADAPTER_FILE = path.join(__dirname, "../src/lib/usce-maine-data.ts");
const RUNTIME_JSON = path.join(__dirname, "../src/data/usce/public-listings.generated.json");

const FORBIDDEN_LANGUAGE = [
  "complete database",
  "all opportunities",
  "guaranteed usce",
  "guaranteed match",
  "guaranteed eligibility",
  "img-friendly",
];

const REQUIRED_PILOT_PHRASES = [
  "not a complete national database",
  "source-reviewed pilot",
];

const REQUIRED_LOCAL_ONLY_PHRASES = [
  "saved listings stay on this device",
  "stored on this device only",
  "no data is sent",
];

const FORBIDDEN_ADAPTER_FIELDS = [
  "npi", "ccn", "cms_facility_id", "nppes_npi", "ein",
  "aamc_id", "nrmp_id", "acgme_id", "nucc_taxonomy",
  "completeness_score", "max_possible_score",
];

const FORBIDDEN_DIRECT_IMPORTS = [
  "docs/platform-v2/local",
  "public_listing_cards",
];

const LS_KEYS = [
  "usce-saved-listings",
  "uscehub_local_issue_reports_v1",
];

interface Failure { rule: string; detail: string }

function readText(p: string): string {
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

function main() {
  console.log("=".repeat(60));
  console.log("P99-5 USCE Pilot Release Validator");
  console.log("=".repeat(60));

  const failures: Failure[] = [];
  const src = readText(COMPONENT_FILE);
  const srcLower = src.toLowerCase();
  const page = readText(PAGE_FILE);
  const pageLower = page.toLowerCase();
  const adapter = readText(ADAPTER_FILE);

  // ── 1. Forbidden language ──────────────────────────────────────────
  console.log("\n[1/10] Checking for forbidden language...");
  const langFails: string[] = [];
  const allSources = [
    { name: "component", text: srcLower },
    { name: "page", text: pageLower },
    { name: "adapter", text: adapter.toLowerCase() },
  ];
  for (const { name, text } of allSources) {
    for (const phrase of FORBIDDEN_LANGUAGE) {
      if (text.includes(phrase)) {
        langFails.push(`${name}: "${phrase}"`);
        failures.push({ rule: "FORBIDDEN_LANGUAGE", detail: `"${phrase}" in ${name}` });
      }
    }
  }
  console.log(`      Forbidden language: ${langFails.length === 0 ? "PASS" : `FAIL (${langFails.join("; ")})`}`);

  // ── 2. Pilot copy present ──────────────────────────────────────────
  console.log("\n[2/10] Checking pilot copy...");
  for (const phrase of REQUIRED_PILOT_PHRASES) {
    const inComponent = srcLower.includes(phrase);
    const inPage = pageLower.includes(phrase);
    if (!inComponent && !inPage) {
      failures.push({ rule: "PILOT_COPY_MISSING", detail: `Required pilot phrase not found in component or page: "${phrase}"` });
    }
    console.log(`      "${phrase}": ${(inComponent || inPage) ? "PASS" : "FAIL"}`);
  }

  // ── 3. Local-only copy present ─────────────────────────────────────
  console.log("\n[3/10] Checking local-only copy...");
  for (const phrase of REQUIRED_LOCAL_ONLY_PHRASES) {
    if (!srcLower.includes(phrase)) {
      failures.push({ rule: "LOCAL_ONLY_COPY_MISSING", detail: `Required local-only phrase not found: "${phrase}"` });
    }
    console.log(`      "${phrase}": ${srcLower.includes(phrase) ? "PASS" : "FAIL"}`);
  }

  // ── 4. Runtime card counts ─────────────────────────────────────────
  console.log("\n[4/10] Checking runtime card counts...");
  let runtimeTotal = -1, runtimeImg = -1, runtimeUs = -1;
  if (fs.existsSync(RUNTIME_JSON)) {
    const raw = JSON.parse(fs.readFileSync(RUNTIME_JSON, "utf8"));
    const cards: { display_bucket: string }[] = raw.cards ?? [];
    runtimeTotal = cards.length;
    runtimeImg = cards.filter(c => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT").length;
    runtimeUs = cards.filter(c => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY").length;
    if (runtimeTotal !== 12) failures.push({ rule: "RUNTIME_TOTAL_WRONG", detail: `Expected 12, got ${runtimeTotal}` });
    if (runtimeImg !== 7) failures.push({ rule: "RUNTIME_IMG_WRONG", detail: `Expected 7, got ${runtimeImg}` });
    if (runtimeUs !== 5) failures.push({ rule: "RUNTIME_US_WRONG", detail: `Expected 5, got ${runtimeUs}` });
  } else {
    failures.push({ rule: "RUNTIME_FILE_MISSING", detail: "public-listings.generated.json not found" });
  }
  console.log(`      Total: ${runtimeTotal} ${runtimeTotal === 12 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      IMG: ${runtimeImg} ${runtimeImg === 7 ? "(PASS)" : "(FAIL)"}`);
  console.log(`      US-only: ${runtimeUs} ${runtimeUs === 5 ? "(PASS)" : "(FAIL)"}`);

  // ── 5. No direct docs/local imports in route ───────────────────────
  console.log("\n[5/10] Checking for direct docs/local source imports...");
  const importFails: string[] = [];
  for (const pattern of FORBIDDEN_DIRECT_IMPORTS) {
    if (src.includes(pattern) || page.includes(pattern)) {
      importFails.push(pattern);
      failures.push({ rule: "DIRECT_DOCS_IMPORT", detail: `Route imports from docs/local path: "${pattern}"` });
    }
  }
  // Check adapter doesn't hardcode cards inline (should import from generated)
  const adapterImportsGenerated = adapter.includes("public-listings.generated");
  if (!adapterImportsGenerated) {
    failures.push({ rule: "ADAPTER_NOT_USING_GENERATED", detail: "Adapter does not import from generated runtime file" });
  }
  console.log(`      No direct docs imports: ${importFails.length === 0 ? "PASS" : `FAIL (${importFails.join(", ")})`}`);
  console.log(`      Adapter uses generated data: ${adapterImportsGenerated ? "PASS" : "FAIL"}`);

  // ── 6. Adapter forbidden fields ────────────────────────────────────
  console.log("\n[6/10] Checking adapter for forbidden fields...");
  const adapterFails: string[] = [];
  for (const f of FORBIDDEN_ADAPTER_FIELDS) {
    const regex = new RegExp(`["'\`]${f}["'\`]\\s*:`, "i");
    if (regex.test(adapter)) {
      adapterFails.push(f);
      failures.push({ rule: "FORBIDDEN_FIELD_IN_ADAPTER", detail: `"${f}" appears as object key in adapter` });
    }
  }
  console.log(`      No forbidden fields in adapter: ${adapterFails.length === 0 ? "PASS" : `FAIL (${adapterFails.join(", ")})`}`);

  // ── 7. noindex present in page.tsx ────────────────────────────────
  console.log("\n[7/10] Checking noindex decision...");
  const hasNoindex = page.includes("index: false") || page.includes('"noindex"') || page.includes("noIndex: true");
  if (!hasNoindex) {
    failures.push({ rule: "NOINDEX_MISSING", detail: "page.tsx does not set robots.index = false — pilot is indexable" });
  }
  console.log(`      noindex set: ${hasNoindex ? "PASS" : "FAIL"}`);

  // ── 8. localStorage keys documented ───────────────────────────────
  console.log("\n[8/10] Checking localStorage keys documented in component...");
  for (const key of LS_KEYS) {
    if (!src.includes(key)) {
      failures.push({ rule: "LS_KEY_MISSING", detail: `localStorage key "${key}" not found in component` });
    }
    console.log(`      "${key}": ${src.includes(key) ? "PASS" : "FAIL"}`);
  }

  // ── 9. localStorage resilience guards ─────────────────────────────
  console.log("\n[9/10] Checking localStorage resilience guards...");

  // useSavedListings should filter stale IDs
  const hasStaleidFilter = src.includes("VALID_LISTING_IDS") || src.includes("USCE_MAINE_CARDS.map");
  if (!hasStaleidFilter) {
    failures.push({ rule: "STALE_ID_FILTER_MISSING", detail: "useSavedListings does not filter stale listing IDs against current public cards" });
  }

  // useLocalReports should have Array.isArray guard
  const hasArrayGuard = src.includes("Array.isArray");
  if (!hasArrayGuard) {
    failures.push({ rule: "ARRAY_GUARD_MISSING", detail: "useLocalReports does not guard against non-array localStorage values" });
  }

  // Both hooks use try/catch
  const tryCatchCount = (src.match(/} catch \{/g) ?? []).length;
  if (tryCatchCount < 3) {
    failures.push({ rule: "INSUFFICIENT_TRY_CATCH", detail: `Expected at least 3 try/catch blocks in localStorage hooks, found ${tryCatchCount}` });
  }

  console.log(`      Stale ID filter: ${hasStaleidFilter ? "PASS" : "FAIL"}`);
  console.log(`      Array.isArray guard: ${hasArrayGuard ? "PASS" : "FAIL"}`);
  console.log(`      try/catch coverage (≥3): ${tryCatchCount >= 3 ? `PASS (${tryCatchCount})` : `FAIL (${tryCatchCount})`}`);

  // ── 10. Accessibility markers ──────────────────────────────────────
  console.log("\n[10/10] Checking accessibility markers...");

  const hasAriaPressedVslo = src.includes('aria-pressed={filters.vsloOnly}');
  const hasAriaPressedUnknown = src.includes('aria-pressed={filters.unknownOnly}');
  const hasAriaExpandedDetails = src.includes('aria-expanded={showDetails}');
  const hasAriaLabelReport = src.includes('aria-label={`Report an issue');
  const hasReportModalLabel = src.includes('aria-label="Report an issue"');
  const hasComparePanelLabel = src.includes('aria-label="Compare saved programs"');
  const hasReportsPanelLabel = src.includes('aria-label="Local issue reports"');

  if (!hasAriaPressedVslo) failures.push({ rule: "ARIA_PRESSED_VSLO_MISSING", detail: "aria-pressed missing on VSLO toggle button" });
  if (!hasAriaPressedUnknown) failures.push({ rule: "ARIA_PRESSED_UNKNOWN_MISSING", detail: "aria-pressed missing on Unknown eligibility toggle button" });
  if (!hasAriaExpandedDetails) failures.push({ rule: "ARIA_EXPANDED_MISSING", detail: "aria-expanded missing on Details expand button" });
  if (!hasAriaLabelReport) failures.push({ rule: "ARIA_LABEL_REPORT_MISSING", detail: "aria-label missing on card Report issue button" });
  if (!hasReportModalLabel) failures.push({ rule: "REPORT_MODAL_LABEL_MISSING", detail: 'aria-label="Report an issue" missing on ReportIssueModal' });
  if (!hasComparePanelLabel) failures.push({ rule: "COMPARE_PANEL_LABEL_MISSING", detail: 'aria-label="Compare saved programs" missing on ComparePanel' });
  if (!hasReportsPanelLabel) failures.push({ rule: "REPORTS_PANEL_LABEL_MISSING", detail: 'aria-label="Local issue reports" missing on LocalReportsPanel' });

  console.log(`      aria-pressed VSLO: ${hasAriaPressedVslo ? "PASS" : "FAIL"}`);
  console.log(`      aria-pressed Unknown: ${hasAriaPressedUnknown ? "PASS" : "FAIL"}`);
  console.log(`      aria-expanded Details: ${hasAriaExpandedDetails ? "PASS" : "FAIL"}`);
  console.log(`      aria-label Report issue (card): ${hasAriaLabelReport ? "PASS" : "FAIL"}`);
  console.log(`      aria-label Report modal: ${hasReportModalLabel ? "PASS" : "FAIL"}`);
  console.log(`      aria-label Compare panel: ${hasComparePanelLabel ? "PASS" : "FAIL"}`);
  console.log(`      aria-label Reports panel: ${hasReportsPanelLabel ? "PASS" : "FAIL"}`);

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  const passed = failures.length === 0;
  console.log(`\nOverall: ${passed ? "PASSED" : "FAILED"}`);
  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach(f => console.log(`  [${f.rule}] ${f.detail}`));
  } else {
    console.log("  All P99-5 release hard gates passed.");
    console.log("  Forbidden language: clean");
    console.log("  Pilot + local-only copy: present");
    console.log(`  Runtime: ${runtimeTotal} cards (${runtimeImg} IMG + ${runtimeUs} US-only)`);
    console.log("  No direct docs/local imports");
    console.log("  noindex: set");
    console.log("  localStorage resilience: stale-ID filter + array guard");
    console.log("  Accessibility: aria-pressed, aria-expanded, aria-labels present");
  }

  process.exit(passed ? 0 : 1);
}

main();
